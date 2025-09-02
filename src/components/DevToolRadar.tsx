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
  adopt: 'Recommend Adoption',
  trial: 'Internal Trial', 
  evaluate: 'Under Evaluation',
  aware: 'In Backlog'
};

const CATEGORY_ORDER: Assessment[] = ['aware', 'evaluate', 'trial', 'adopt'];

interface DevToolRadarProps {
  className?: string;
}

export const DevToolRadar: React.FC<DevToolRadarProps> = ({ 
  className
}) => {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

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

  return (
    <div className={`dev-tool-radar ${className || ''}`}>
      <div className="radar-container">
        <div className="boxes-panel">
          <div className="category-flow">
            {CATEGORY_ORDER.map((category, index) => (
              <div key={category} className="category-container">
                <div 
                  className={`category-box ${category === 'aware' ? 'backlog' : ''}`}
                  style={{ backgroundColor: category === 'aware' ? 'transparent' : CATEGORY_COLORS[category] }}
                >
                  <h3 className="category-title">{CATEGORY_LABELS[category]}</h3>
                  <div className="tools-container">
                    {(toolsByCategory[category] || []).map((tool) => (
                      <button
                        key={tool.id}
                        className={`tool-pill ${
                          selectedTool?.id === tool.id ? 'selected' : ''
                        } ${
                          tool.reviewer ? 'has-reviewer' : ''
                        }`}
                        onClick={() => handleToolClick(tool)}
                        title={tool.description}
                      >
                        <span className="tool-title">{tool.title}</span>
                        {tool.reviewer && (
                          <div className="reviewer-tag">
                            <img 
                              src={tool.reviewer.photoUrl} 
                              alt={tool.reviewer.name}
                              className="reviewer-portrait"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMTAiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTYgNkM3LjEwNDU3IDYgOCA1LjEwNDU3IDggNEM4IDIuODk1NDMgNy4xMDQ1NyAyIDYgMkM0Ljg5NTQzIDIgNCAyLjg5NTQzIDQgNEM0IDUuMTA0NTcgNC44OTU0MyA2IDYgNloiIGZpbGw9IiM5QjlCQTQiLz4KPHBhdGggZD0iTTYgN0M0Ljc1IDcgMi44NzUgNy43NSAyIDkuMjVWMTBIMTBWOS4yNUM5LjEyNSA3Ljc1IDcuMjUgNyA2IDdaIiBmaWxsPSIjOUI5QkE0Ii8+Cjwvc3ZnPgo8L3N2Zz4K';
                              }}
                            />
                          </div>
                        )}
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
              <div className="tool-header">
                <h3>{selectedTool.title}</h3>
                <a 
                  href={selectedTool.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="tool-link"
                >
                  Product Website →
                </a>
              </div>
              
              <div className="tool-content">
                <div className="content-grid">
                  <div className="field-box description-box">
                    <h4 className="field-title">Description</h4>
                    <p className="field-content">{selectedTool.description}</p>
                  </div>

                  {selectedTool.ourPosition && (
                    <div className="field-box position-box">
                      <h4 className="field-title">Our Position</h4>
                      <p className="field-content">{selectedTool.ourPosition}</p>
                      {selectedTool.reviewer && (
                        <div className="position-reviewer-info">
                          <img 
                            src={selectedTool.reviewer.photoUrl} 
                            alt={selectedTool.reviewer.name}
                            className="reviewer-photo"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSIjOUI5QkE0Ii8+CjxwYXRoIGQ9Ik0xMiAxNEM5LjUgMTQgNS43NSAxNS41IDQgMTguNVYyMEgyMFYxOC41QzE4LjI1IDE1LjUgMTQuNSAxNCAxMiAxNFoiIGZpbGw9IiM5QjlCQTQiLz4KPHN2Zz4KPHN2Zz4K';
                            }}
                          />
                          <span className="reviewer-name">{selectedTool.reviewer.name}</span>
                          <span className="reviewer-label">Reviewer</span>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedTool.aiPosition && (
                    <div className="field-box ai-position-box">
                      <h4 className="field-title">AI Position</h4>
                      <p className="field-content">{selectedTool.aiPosition}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="placeholder">
              <h4>Development Tool Radar</h4>
              <p>Select a tool to see details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
