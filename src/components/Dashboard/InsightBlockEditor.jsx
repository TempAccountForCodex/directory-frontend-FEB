import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import {
  Plus as AddIcon,
  Trash2 as DeleteIcon,
  GripVertical as DragIcon,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Code as CodeIcon,
} from 'lucide-react';

const BLOCK_TYPES = [
  { value: 'section', label: 'Section', icon: '📝' },
  { value: 'quote', label: 'Quote', icon: '💬' },
  { value: 'keyTakeaway', label: 'Key Takeaway', icon: '💡' },
  { value: 'conclusion', label: 'Conclusion', icon: '🎯' },
  { value: 'code', label: 'Code', icon: '💻' },
];

const generateBlockId = () => `blk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const InsightBlockEditor = ({ blocks, onChange, error }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleAddBlock = (type) => {
    const newBlock = {
      id: generateBlockId(),
      type,
    };

    switch (type) {
      case 'section':
        newBlock.heading = '';
        newBlock.paragraphs = [''];
        break;
      case 'quote':
        newBlock.text = '';
        newBlock.attribution = null;
        break;
      case 'keyTakeaway':
        newBlock.title = 'Key Takeaway';
        newBlock.text = '';
        break;
      case 'conclusion':
        newBlock.heading = 'Conclusion';
        newBlock.paragraphs = [''];
        break;
      case 'code':
        newBlock.language = 'javascript';
        newBlock.code = '';
        break;
      default:
        return;
    }

    onChange([...blocks, newBlock]);
  };

  const handleRemoveBlock = (index) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    onChange(newBlocks);
  };

  const handleBlockChange = (index, field, value) => {
    const newBlocks = [...blocks];
    newBlocks[index][field] = value;
    onChange(newBlocks);
  };

  const handleParagraphChange = (blockIndex, paragraphIndex, value) => {
    const newBlocks = [...blocks];
    newBlocks[blockIndex].paragraphs[paragraphIndex] = value;
    onChange(newBlocks);
  };

  const handleAddParagraph = (blockIndex) => {
    const newBlocks = [...blocks];
    newBlocks[blockIndex].paragraphs.push('');
    onChange(newBlocks);
  };

  const handleRemoveParagraph = (blockIndex, paragraphIndex) => {
    const newBlocks = [...blocks];
    newBlocks[blockIndex].paragraphs = newBlocks[blockIndex].paragraphs.filter(
      (_, i) => i !== paragraphIndex
    );
    onChange(newBlocks);
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newBlocks = [...blocks];
    const draggedBlock = newBlocks[draggedIndex];
    newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(index, 0, draggedBlock);
    
    onChange(newBlocks);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Check if a block type is disabled (already has max count)
  const isBlockTypeDisabled = (type) => {
    if (type === 'keyTakeaway') {
      return blocks.some((b) => b.type === 'keyTakeaway');
    }
    if (type === 'conclusion') {
      return blocks.some((b) => b.type === 'conclusion');
    }
    return false;
  };

  // Check if a block can be dragged (conclusion must stay last)
  const canDragBlock = (index, block) => {
    if (block.type === 'conclusion') {
      return false; // Conclusion is pinned to last position
    }
    return true;
  };

  // Get available block types for the add picker
  const getAvailableBlockTypes = () => {
    return BLOCK_TYPES.filter((bt) => !isBlockTypeDisabled(bt.value));
  };

  const renderBlockEditor = (block, index) => {
    const isDraggable = canDragBlock(index, block);

    return (
      <Card
        key={block.id}
        draggable={isDraggable}
        onDragStart={() => handleDragStart(index)}
        onDragOver={(e) => handleDragOver(e, index)}
        onDragEnd={handleDragEnd}
        sx={{
          mb: 2,
          border: `1px solid ${error ? 'rgba(211, 47, 47, 0.3)' : 'rgba(0, 0, 0, 0.12)'}`,
          backgroundColor: draggedIndex === index ? 'rgba(55, 140, 146, 0.05)' : 'background.paper',
          cursor: isDraggable ? 'move' : 'default',
          opacity: draggedIndex === index ? 0.8 : 1,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
            {isDraggable && (
              <IconButton
                size="small"
                sx={{ cursor: 'grab', color: 'text.secondary' }}
              >
                <DragIcon size={18} />
              </IconButton>
            )}
            <Chip
              label={BLOCK_TYPES.find((bt) => bt.value === block.type)?.label || block.type}
              size="small"
              sx={{
                backgroundColor: 'rgba(55, 140, 146, 0.1)',
                color: '#378C92',
                fontWeight: 600,
              }}
            />
            <Box sx={{ flexGrow: 1 }} />
            <IconButton
              size="small"
              onClick={() => handleRemoveBlock(index)}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon size={18} />
            </IconButton>
          </Box>

          {block.type === 'section' && (
            <Box>
              <TextField
                fullWidth
                label="Section Heading"
                value={block.heading || ''}
                onChange={(e) => handleBlockChange(index, 'heading', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
              />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Paragraphs
              </Typography>
              {(block.paragraphs || []).map((paragraph, pIdx) => (
                <Box key={pIdx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label={`Paragraph ${pIdx + 1}`}
                    value={paragraph}
                    onChange={(e) => handleParagraphChange(index, pIdx, e.target.value)}
                    size="small"
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveParagraph(index, pIdx)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon size={16} />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon size={16} />}
                onClick={() => handleAddParagraph(index)}
                size="small"
                sx={{ mt: 1 }}
              >
                Add Paragraph
              </Button>
            </Box>
          )}

          {block.type === 'quote' && (
            <Box>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Quote Text"
                value={block.text || ''}
                onChange={(e) => handleBlockChange(index, 'text', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
              />
              <TextField
                fullWidth
                label="Attribution (optional)"
                value={block.attribution || ''}
                onChange={(e) => handleBlockChange(index, 'attribution', e.target.value)}
                size="small"
              />
            </Box>
          )}

          {block.type === 'keyTakeaway' && (
            <Box>
              <TextField
                fullWidth
                label="Title"
                value={block.title || 'Key Takeaway'}
                onChange={(e) => handleBlockChange(index, 'title', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Key Takeaway Text"
                value={block.text || ''}
                onChange={(e) => handleBlockChange(index, 'text', e.target.value)}
                size="small"
              />
            </Box>
          )}

          {block.type === 'conclusion' && (
            <Box>
              <TextField
                fullWidth
                label="Conclusion Heading"
                value={block.heading || 'Conclusion'}
                onChange={(e) => handleBlockChange(index, 'heading', e.target.value)}
                sx={{ mb: 2 }}
                size="small"
              />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Conclusion Paragraphs
              </Typography>
              {(block.paragraphs || []).map((paragraph, pIdx) => (
                <Box key={pIdx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label={`Paragraph ${pIdx + 1}`}
                    value={paragraph}
                    onChange={(e) => handleParagraphChange(index, pIdx, e.target.value)}
                    size="small"
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveParagraph(index, pIdx)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon size={16} />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon size={16} />}
                onClick={() => handleAddParagraph(index)}
                size="small"
                sx={{ mt: 1 }}
              >
                Add Paragraph
              </Button>
            </Box>
          )}

          {block.type === 'code' && (
            <Box>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel size="small">Language</InputLabel>
                <Select
                  size="small"
                  value={block.language || 'javascript'}
                  label="Language"
                  onChange={(e) => handleBlockChange(index, 'language', e.target.value)}
                >
                  <MenuItem value="javascript">JavaScript</MenuItem>
                  <MenuItem value="typescript">TypeScript</MenuItem>
                  <MenuItem value="python">Python</MenuItem>
                  <MenuItem value="java">Java</MenuItem>
                  <MenuItem value="cpp">C++</MenuItem>
                  <MenuItem value="css">CSS</MenuItem>
                  <MenuItem value="html">HTML</MenuItem>
                  <MenuItem value="json">JSON</MenuItem>
                  <MenuItem value="bash">Bash</MenuItem>
                  <MenuItem value="sql">SQL</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                multiline
                rows={8}
                label="Code"
                value={block.code || ''}
                onChange={(e) => handleBlockChange(index, 'code', e.target.value)}
                size="small"
                sx={{
                  fontFamily: 'monospace',
                  '& .MuiInputBase-input': {
                    fontFamily: 'Consolas, Monaco, monospace',
                  },
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const availableTypes = getAvailableBlockTypes();

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Content Blocks
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {blocks.length === 0 ? (
        <Box
          sx={{
            p: 4,
            border: '2px dashed rgba(0, 0, 0, 0.12)',
            borderRadius: 2,
            textAlign: 'center',
            color: 'text.secondary',
          }}
        >
          <Typography variant="body1" sx={{ mb: 2 }}>
            No blocks added yet. Add your first block to start building your insight.
          </Typography>
        </Box>
      ) : (
        <Box>
          {blocks.map((block, index) => renderBlockEditor(block, index))}
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        Add Block
      </Typography>

      {availableTypes.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          All block types have been added. You can edit existing blocks above.
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {availableTypes.map((blockType) => (
            <Button
              key={blockType.value}
              variant="outlined"
              startIcon={<span>{blockType.icon}</span>}
              onClick={() => handleAddBlock(blockType.value)}
              size="small"
            >
              {blockType.label}
            </Button>
          ))}
        </Box>
      )}

      <Box sx={{ mt: 2, color: 'text.secondary', fontSize: '0.85rem' }}>
        <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
          💡 Tips:
        </Typography>
        <Typography variant="caption" display="block">
          • Drag blocks to reorder them (conclusion stays last)
        </Typography>
        <Typography variant="caption" display="block">
          • Only one Key Takeaway and one Conclusion allowed per insight
        </Typography>
        <Typography variant="caption" display="block">
          • At least one block is required to save
        </Typography>
      </Box>
    </Box>
  );
};

export default InsightBlockEditor;
