import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { Tool, ToolWithPosition, Assessment } from '../types/Tool';
import toolsData from '../data/tools.json';
import './DevToolRadar.css';

const NATIONWIDE_BLUE = '#003f7f';
const RING_COLORS = {
  adopt: '#22c55e',      // Green
  trial: '#fbbf24',      // Yellow
  evaluate: '#fb923c',   // Yellow-orange
  aware: '#4d7ba3'       // Lightest (outermost)
};

const RING_FILL_COLORS = {
  adopt: 'rgba(34, 197, 94, 0.15)',    // Green fill (innermost)
  trial: 'rgba(251, 191, 36, 0.12)',   // Yellow fill
  evaluate: 'rgba(251, 146, 60, 0.09)', // Yellow-orange fill
  aware: 'rgba(77, 123, 163, 0.06)'    // Lightest blue fill (outermost)
};

const RING_LABELS = {
  adopt: 'Adopt',
  trial: 'Trial', 
  evaluate: 'Evaluate',
  aware: 'Aware'
};

const RING_ORDER: Assessment[] = ['adopt', 'trial', 'evaluate', 'aware'];

// Simple hash function to create deterministic "randomness" based on tool id
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

interface DevToolRadarProps {
  aspectRatio?: number; // width/height ratio, defaults to 1.67 (5:3)
  className?: string;
}

export const DevToolRadar: React.FC<DevToolRadarProps> = ({ 
  aspectRatio = 5/3, // 5:3 aspect ratio by default
  className
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [hoveredTool, setHoveredTool] = useState<Tool | null>(null);
  const [positionedTools, setPositionedTools] = useState<ToolWithPosition[]>([]);
  const [hoveredFromList, setHoveredFromList] = useState<string | null>(null);
  const [hoveredFromBlip, setHoveredFromBlip] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Use fixed coordinate system for viewBox (will be scaled by container)
  const viewBoxWidth = 1000;
  const viewBoxHeight = viewBoxWidth / aspectRatio;
  
  // For single quadrant, we need different positioning
  // The quadrant should fit entirely within the available space
  const margin = 40;
  const availableWidth = viewBoxWidth - margin * 2;
  const availableHeight = viewBoxHeight - margin * 2;
  const maxRadius = Math.min(availableWidth, availableHeight);
  
  // Position the "center" (corner of our quadrant) so the quadrant fits in the pane
  const centerX = margin + maxRadius;
  const centerY = margin + maxRadius;

  // Calculate ring radii for the quadrant (memoized to prevent re-renders)
  const ringRadii = useMemo(() => ({
    adopt: maxRadius * 0.25,
    trial: maxRadius * 0.45, 
    evaluate: maxRadius * 0.7,
    aware: maxRadius * 0.95
  }), [maxRadius]);

  // Position tools without overlap (single quadrant)
  const positionTools = useCallback((tools: Tool[]): ToolWithPosition[] => {
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
        // Use deterministic "randomness" based on tool id
        const hash = hashCode(tool.id);
        const radiusRandom = (hash % 100) / 100; // 0-1
        const angleRandom = ((hash * 7) % 100) / 100 - 0.5; // -0.5 to 0.5
        
        // Add some variation to radius within the ring bounds
        let minRadius, maxRadius;
        
        if (assessment === 'aware') {
          // AWARE tools are positioned in the unlimited space beyond EVALUATE ring
          minRadius = ringRadii.evaluate;
          maxRadius = ringRadii.evaluate + (ringRadii.aware - ringRadii.evaluate) * 0.8; // Use 80% of available outer space
        } else if (assessment === 'adopt') {
          minRadius = 0;
          maxRadius = ringRadius;
        } else {
          minRadius = ringRadii[RING_ORDER[RING_ORDER.indexOf(assessment as Assessment) - 1]];
          maxRadius = ringRadius;
        }
        
        const randomRadius = minRadius + (maxRadius - minRadius) * (0.3 + radiusRandom * 0.4);
        
        const angle = angleStep * (index + 1) + angleRandom * angleStep * 0.3;
        
        // Convert to Cartesian coordinates (top-left quadrant)
        // Note: we're positioning relative to the corner point (centerX, centerY)
        const x = centerX - randomRadius * Math.cos(angle);
        const y = centerY - randomRadius * Math.sin(angle);
        
        positioned.push({
          ...tool,
          position: { x, y, angle, radius: randomRadius }
        });
      });
    });

    return positioned;
  }, [centerX, centerY, ringRadii]);

  // Memoize positioned tools to prevent unnecessary recalculations
  const memoizedPositionedTools = useMemo(() => {
    const tools = toolsData as Tool[];
    return positionTools(tools);
  }, [positionTools]);

  // Memoize alphabetically sorted tools for the tool list
  const alphabeticalTools = useMemo(() => {
    const tools = toolsData as Tool[];
    return [...tools].sort((a, b) => a.title.localeCompare(b.title));
  }, []);

  // Filter tools based on search term
  const filteredTools = useMemo(() => {
    if (!searchTerm.trim()) {
      return alphabeticalTools;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return alphabeticalTools.filter(tool => 
      tool.title.toLowerCase().includes(lowerSearchTerm) ||
      tool.description.toLowerCase().includes(lowerSearchTerm)
    );
  }, [alphabeticalTools, searchTerm]);

  useEffect(() => {
    setPositionedTools(memoizedPositionedTools);
  }, [memoizedPositionedTools]);

  useEffect(() => {
    if (!svgRef.current || positionedTools.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create main group with horizontal centering transform
    // Calculate the horizontal offset to center the radar quadrant
    const radarWidth = maxRadius; // The quadrant extends maxRadius to the left
    const horizontalOffset = (viewBoxWidth - radarWidth) / 2 - margin;
    const g = svg.append('g')
      .attr('transform', `translate(${horizontalOffset}, 0)`);

    // Draw filled ring sectors (pie slices) first - only for ADOPT, TRIAL, EVALUATE
    // AWARE space is outside the last ring, so no fill needed
    const filledRings = RING_ORDER.slice(0, -1); // All except AWARE
    filledRings.forEach((assessment, index) => {
      const outerRadius = ringRadii[assessment];
      const innerRadius = index === 0 ? 0 : ringRadii[RING_ORDER[index - 1]];
      
      // Create filled sector path for top-left quadrant
      let sectorPath;
      if (innerRadius === 0) {
        // For the innermost ring, start from center
        sectorPath = `M ${centerX} ${centerY} L ${centerX} ${centerY - outerRadius} A ${outerRadius} ${outerRadius} 0 0 0 ${centerX - outerRadius} ${centerY} Z`;
      } else {
        // For other rings, create a donut sector
        sectorPath = `M ${centerX} ${centerY - innerRadius} L ${centerX} ${centerY - outerRadius} A ${outerRadius} ${outerRadius} 0 0 0 ${centerX - outerRadius} ${centerY} L ${centerX - innerRadius} ${centerY} A ${innerRadius} ${innerRadius} 0 0 1 ${centerX} ${centerY - innerRadius} Z`;
      }
      
      g.append('path')
        .attr('d', sectorPath)
        .attr('fill', RING_FILL_COLORS[assessment])
        .attr('stroke', 'none');
    });

    // Draw quarter circle arcs (top-left quadrant only) - borders
    // Only draw rings for ADOPT, TRIAL, EVALUATE (not AWARE)
    const visibleRings = RING_ORDER.slice(0, -1); // All except AWARE
    visibleRings.forEach((assessment) => {
      const r = ringRadii[assessment];
      // Create arc path for top-left quadrant (90 degrees from -90° to 0°)
      const arcPath = `M ${centerX} ${centerY - r} A ${r} ${r} 0 0 0 ${centerX - r} ${centerY}`;
      
      g.append('path')
        .attr('d', arcPath)
        .attr('fill', 'none')
        .attr('stroke', RING_COLORS[assessment])
        .attr('stroke-width', 2)
        .attr('opacity', 0.6);
    });

    // Draw quadrant boundary lines (only two edges since we have one quadrant)
    // Extend lines to the edge of the available space, not just to EVALUATE ring
    g.append('line')
      .attr('x1', centerX - maxRadius)
      .attr('y1', centerY)
      .attr('x2', centerX)
      .attr('y2', centerY)
      .attr('stroke', NATIONWIDE_BLUE)
      .attr('stroke-width', 2)
      .attr('opacity', 0.8);

    g.append('line')
      .attr('x1', centerX)
      .attr('y1', centerY - maxRadius)
      .attr('x2', centerX)
      .attr('y2', centerY)
      .attr('stroke', NATIONWIDE_BLUE)
      .attr('stroke-width', 2)
      .attr('opacity', 0.8);

    // Draw ring labels inside their respective ring areas
    RING_ORDER.forEach((assessment, index) => {
      let labelRadius;
      
      if (assessment === 'adopt') {
        // For the innermost ring, position in the middle of the ring
        labelRadius = ringRadii[assessment] * 0.6;
      } else if (assessment === 'aware') {
        // For AWARE, position in the outer area beyond EVALUATE ring
        labelRadius = ringRadii.evaluate + (maxRadius - ringRadii.evaluate) * 0.4;
      } else {
        // For other rings, position in the middle between inner and outer boundaries
        const innerRadius = ringRadii[RING_ORDER[index - 1]];
        const outerRadius = ringRadii[assessment];
        labelRadius = (innerRadius + outerRadius) / 2;
      }
      
      // Create a subtle text shadow for better readability
      const textX = centerX - labelRadius * Math.cos(Math.PI / 4);
      const textY = centerY - labelRadius * Math.sin(Math.PI / 4) + 6;
      
      // Background shadow
      g.append('text')
        .attr('x', textX + 1)
        .attr('y', textY + 1)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'Arial, sans-serif')
        .attr('font-size', '16px')
        .attr('font-weight', '900')
        .attr('fill', '#ffffff')
        .attr('opacity', 0.3)
        .attr('letter-spacing', '1px')
        .style('text-transform', 'uppercase')
        .text(RING_LABELS[assessment]);
      
      // Main text
      g.append('text')
        .attr('x', textX)
        .attr('y', textY)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'Arial, sans-serif')
        .attr('font-size', '16px')
        .attr('font-weight', '900')
        .attr('fill', RING_COLORS[assessment])
        .attr('opacity', 0.5)
        .attr('letter-spacing', '1px')
        .style('text-transform', 'uppercase')
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
      .attr('r', d => (hoveredFromList === d.id || selectedTool?.id === d.id) ? 14 : 10)
      .attr('fill', d => RING_COLORS[d.assessment])
      .attr('stroke', NATIONWIDE_BLUE)
      .attr('stroke-width', d => (hoveredFromList === d.id || selectedTool?.id === d.id) ? 3 : 2)
      .attr('opacity', d => hoveredFromList && hoveredFromList !== d.id ? 0.3 : 1)
      .on('mouseenter', (event, d) => {
        setHoveredTool(d);
        setHoveredFromBlip(d.id);
        d3.select(event.target)
          .transition()
          .duration(200)
          .attr('r', 14);
      })
      .on('mouseleave', (event) => {
        setHoveredTool(null);
        setHoveredFromBlip(null);
        d3.select(event.target)
          .transition()
          .duration(200)
          .attr('r', 10);
      })
      .on('click', (_, d) => {
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
      .text((_, i) => i + 1);

  }, [positionedTools, centerX, centerY, ringRadii, maxRadius, hoveredFromList, selectedTool]);

  const handleToolListHover = (toolId: string | null) => {
    setHoveredFromList(toolId);
    if (toolId) {
      const tool = positionedTools.find(t => t.id === toolId);
      if (tool) {
        setHoveredTool(tool);
      }
    } else {
      setHoveredTool(null);
    }
  };

  const handleToolListClick = (toolId: string) => {
    const tool = positionedTools.find(t => t.id === toolId);
    if (tool) {
      setSelectedTool(tool);
    }
  };

  return (
    <div className={`dev-tool-radar ${className || ''}`}>
      <div className="radar-container">
        <div className="tool-list-panel">
          <div className="tool-list-header">
            <h4>Tools</h4>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="search-clear-button"
                  aria-label="Clear search"
                  type="button"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          <div className="tool-list-content">
            {filteredTools.map((tool) => (
              <div 
                key={tool.id}
                className={`tool-list-item ${
                  selectedTool?.id === tool.id ? 'selected' : ''
                } ${
                  hoveredFromList === tool.id || hoveredFromBlip === tool.id ? 'hovered' : ''
                }`}
                onMouseEnter={() => handleToolListHover(tool.id)}
                onMouseLeave={() => handleToolListHover(null)}
                onClick={() => handleToolListClick(tool.id)}
              >
                {tool.title}
              </div>
            ))}
          </div>
        </div>
        
        <div className="radar-panel">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            className="radar-svg"
            preserveAspectRatio="xMidYMid meet"
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
