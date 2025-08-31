import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Tool, ToolWithPosition, Assessment } from '../types/Tool';
import toolsData from '../data/tools.json';
import './DevToolRadar.css';

const NATIONWIDE_BLUE = '#003f7f';
const RING_COLORS = {
  adopt: '#001a33',      // Darkest (innermost)
  trial: '#002a52',      // Dark
  evaluate: '#003f7f',   // Medium (main Nationwide blue)
  aware: '#4d7ba3'       // Lightest (outermost)
};

const RING_LABELS = {
  adopt: 'Adopt',
  trial: 'Trial', 
  evaluate: 'Evaluate',
  aware: 'Aware'
};

const RING_ORDER: Assessment[] = ['adopt', 'trial', 'evaluate', 'aware'];

interface DevToolRadarProps {
  width?: number;
  height?: number;
}

export const DevToolRadar: React.FC<DevToolRadarProps> = ({ 
  width = 600, 
  height = 600 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [hoveredTool, setHoveredTool] = useState<Tool | null>(null);
  const [positionedTools, setPositionedTools] = useState<ToolWithPosition[]>([]);

  const radius = Math.min(width, height) / 2 - 20;
  const centerX = width / 2;
  const centerY = height / 2;

  // Calculate ring radii
  const ringRadii = {
    adopt: radius * 0.25,
    trial: radius * 0.45,
    evaluate: radius * 0.7,
    aware: radius * 0.95
  };

  // Position tools without overlap
  const positionTools = (tools: Tool[]): ToolWithPosition[] => {
    const positioned: ToolWithPosition[] = [];
    const groupedTools = tools.reduce((acc, tool) => {
      if (!acc[tool.assessment]) acc[tool.assessment] = [];
      acc[tool.assessment].push(tool);
      return acc;
    }, {} as Record<Assessment, Tool[]>);

    Object.entries(groupedTools).forEach(([assessment, toolsInRing]) => {
      const ringRadius = ringRadii[assessment as Assessment];
      const angleStep = (Math.PI / 2) / (toolsInRing.length + 1); // Divide quadrant evenly
      
      toolsInRing.forEach((tool, index) => {
        // Add some randomness to radius within the ring bounds
        const minRadius = assessment === 'adopt' ? 0 : 
          ringRadii[RING_ORDER[RING_ORDER.indexOf(assessment as Assessment) - 1]];
        const maxRadius = ringRadius;
        const randomRadius = minRadius + (maxRadius - minRadius) * (0.3 + Math.random() * 0.4);
        
        const angle = angleStep * (index + 1) + (Math.random() - 0.5) * angleStep * 0.3;
        
        // Convert to Cartesian coordinates (top-left quadrant)
        const x = centerX - randomRadius * Math.cos(angle);
        const y = centerY - randomRadius * Math.sin(angle);
        
        positioned.push({
          ...tool,
          position: { x, y, angle, radius: randomRadius }
        });
      });
    });

    return positioned;
  };

  useEffect(() => {
    const tools = toolsData as Tool[];
    setPositionedTools(positionTools(tools));
  }, []);

  useEffect(() => {
    if (!svgRef.current || positionedTools.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create main group
    const g = svg.append('g');

    // Draw rings
    RING_ORDER.forEach((assessment) => {
      g.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', ringRadii[assessment])
        .attr('fill', 'none')
        .attr('stroke', RING_COLORS[assessment])
        .attr('stroke-width', 2)
        .attr('opacity', 0.6);
    });

    // Draw quadrant lines
    g.append('line')
      .attr('x1', centerX - radius)
      .attr('y1', centerY)
      .attr('x2', centerX)
      .attr('y2', centerY)
      .attr('stroke', NATIONWIDE_BLUE)
      .attr('stroke-width', 2)
      .attr('opacity', 0.8);

    g.append('line')
      .attr('x1', centerX)
      .attr('y1', centerY - radius)
      .attr('x2', centerX)
      .attr('y2', centerY)
      .attr('stroke', NATIONWIDE_BLUE)
      .attr('stroke-width', 2)
      .attr('opacity', 0.8);

    // Draw ring labels
    RING_ORDER.forEach((assessment) => {
      g.append('text')
        .attr('x', centerX - ringRadii[assessment] * Math.cos(Math.PI / 4))
        .attr('y', centerY - ringRadii[assessment] * Math.sin(Math.PI / 4) + 5)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'Arial, sans-serif')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', RING_COLORS[assessment])
        .text(RING_LABELS[assessment]);
    });

    // Draw blips
    const blips = g.selectAll('.blip')
      .data(positionedTools)
      .enter()
      .append('g')
      .attr('class', 'blip')
      .style('cursor', 'pointer');

    blips.append('circle')
      .attr('cx', d => d.position.x)
      .attr('cy', d => d.position.y)
      .attr('r', 8)
      .attr('fill', d => RING_COLORS[d.assessment])
      .attr('stroke', NATIONWIDE_BLUE)
      .attr('stroke-width', 2)
      .on('mouseenter', (event, d) => {
        setHoveredTool(d);
        d3.select(event.target)
          .transition()
          .duration(200)
          .attr('r', 12);
      })
      .on('mouseleave', (event, d) => {
        setHoveredTool(null);
        d3.select(event.target)
          .transition()
          .duration(200)
          .attr('r', 8);
      })
      .on('click', (event, d) => {
        setSelectedTool(d);
      });

    // Add tool numbers/labels
    blips.append('text')
      .attr('x', d => d.position.x)
      .attr('y', d => d.position.y + 4)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Arial, sans-serif')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', 'white')
      .attr('pointer-events', 'none')
      .text((d, i) => i + 1);

  }, [positionedTools, centerX, centerY, radius]);

  return (
    <div className="dev-tool-radar">
      <div className="radar-container">
        <div className="radar-panel">
          <svg
            ref={svgRef}
            width={width}
            height={height}
            className="radar-svg"
          />
        </div>
        
        <div className="details-panel">
          {selectedTool ? (
            <div className="tool-details">
              <h3>{selectedTool.title}</h3>
              <div className="assessment-badge" data-assessment={selectedTool.assessment}>
                {RING_LABELS[selectedTool.assessment]}
              </div>
              <p>{selectedTool.description}</p>
              <a 
                href={selectedTool.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="tool-link"
              >
                Learn More →
              </a>
            </div>
          ) : hoveredTool ? (
            <div className="tool-preview">
              <h4>{hoveredTool.title}</h4>
              <div className="assessment-badge" data-assessment={hoveredTool.assessment}>
                {RING_LABELS[hoveredTool.assessment]}
              </div>
              <p className="preview-text">Click to see full details</p>
            </div>
          ) : (
            <div className="placeholder">
              <h4>Development Tool Radar</h4>
              <p>Hover over or click on a tool to see details</p>
              <div className="legend">
                {RING_ORDER.map(assessment => (
                  <div key={assessment} className="legend-item">
                    <div 
                      className="legend-color" 
                      style={{ backgroundColor: RING_COLORS[assessment] }}
                    />
                    <span>{RING_LABELS[assessment]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
