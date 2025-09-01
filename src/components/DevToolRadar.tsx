import React, { useState, useMemo } from 'react';
import { Tool, Assessment } from '../types/Tool';
import toolsData from '../data/tools.json';
import './DevToolRadar.css';

const CATEGORY_COLORS = {
  adopt: '#22c55e',      // Green
  trial: '#fbbf24',      // Yellow
  evaluate: '#fb923c',   // Orange
  aware: '#4d7ba3'       // Blue
};

const CATEGORY_LABELS = {
  adopt: 'Adopt',
  trial: 'Trial', 
  evaluate: 'Evaluate',
  aware: 'Aware'
};

const CATEGORY_ORDER: Assessment[] = ['aware', 'evaluate', 'trial', 'adopt'];

interface DevToolRadarProps {
  className?: string;
}

export const DevToolRadar: React.FC<DevToolRadarProps> = ({ 
  className
}) => {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [hoveredTool, setHoveredTool] = useState<Tool | null>(null);

  // Group tools by assessment category and sort alphabetically
  const toolsByCategory = useMemo(() => {
    const tools = toolsData as Tool[];
    const grouped = tools.reduce((acc, tool) => {
      if (!acc[tool.assessment]) acc[tool.assessment] = [];
      acc[tool.assessment].push(tool);
      return acc;
    }, {} as Record<Assessment, Tool[]>);
    
    // Sort tools alphabetically within each category
    Object.keys(grouped).forEach(category => {
      grouped[category as Assessment].sort((a, b) => a.title.localeCompare(b.title));
    });
    
    return grouped;
  }, []);

  const handleToolClick = (tool: Tool) => {
    setSelectedTool(tool);
  };

  const handleToolHover = (tool: Tool | null) => {
    setHoveredTool(tool);
  };

  return (
    <div className={`dev-tool-radar ${className || ''}`}>
      <div className="radar-container">
        <div className="boxes-panel">
          <div className="category-flow">
            {CATEGORY_ORDER.map((category, index) => (
              <div key={category} className="category-container">
                <div 
                  className="category-box"
                  style={{ backgroundColor: CATEGORY_COLORS[category] }}
                >
                  <h3 className="category-title">{CATEGORY_LABELS[category]}</h3>
                  <div className="tools-container">
                    {(toolsByCategory[category] || []).map((tool) => (
                      <button
                        key={tool.id}
                        className={`tool-pill ${
                          selectedTool?.id === tool.id ? 'selected' : ''
                        } ${
                          hoveredTool?.id === tool.id ? 'hovered' : ''
                        }`}
                        onMouseEnter={() => handleToolHover(tool)}
                        onMouseLeave={() => handleToolHover(null)}
                        onClick={() => handleToolClick(tool)}
                        title={tool.description}
                      >
                        {tool.title}
                      </button>
                    ))}
                  </div>
                </div>
                {index < CATEGORY_ORDER.length - 1 && (
                  <div className="flow-arrow">
                    <svg viewBox="0 0 24 24" className="arrow-icon">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" fill="currentColor" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="details-panel">
          {selectedTool ? (
            <div className="tool-details">
              <h3>{selectedTool.title}</h3>
              <div className="assessment-badge" data-assessment={selectedTool.assessment}>
                {CATEGORY_LABELS[selectedTool.assessment]}
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
                {CATEGORY_LABELS[hoveredTool.assessment]}
              </div>
              <p className="preview-text">Click to see full details</p>
            </div>
          ) : (
            <div className="placeholder">
              <h4>Development Tool Radar</h4>
              <p>Hover over or click on a tool to see details</p>
              <div className="legend">
                {CATEGORY_ORDER.map(assessment => (
                  <div key={assessment} className="legend-item">
                    <div 
                      className="legend-color" 
                      style={{ backgroundColor: CATEGORY_COLORS[assessment] }}
                    />
                    <span>{CATEGORY_LABELS[assessment]}</span>
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
