/**
 * BlockEditor — barrel exports
 *
 * Provides clean imports for all BlockEditor components:
 *   import { BlockEditor, BlockList, BlockSelector } from './BlockEditor';
 */

export {
  default as BlockEditor,
  BlockEditor as BlockEditorComponent,
} from "./BlockEditor";
export {
  default as BlockList,
  BlockList as BlockListComponent,
} from "./BlockList";
export {
  default as BlockSelector,
  BlockSelector as BlockSelectorComponent,
} from "./BlockSelector";

// Re-export types
export type { Block, BlockListProps } from "./BlockList";
export type { BlockSelectorProps } from "./BlockSelector";
export type { BlockEditorProps } from "./BlockEditor";
