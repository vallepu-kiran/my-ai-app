// // app/types/react-window.d.ts
// declare module 'react-window' {
//     import { ComponentType, CSSProperties } from 'react';

//     interface FixedSizeListProps {
//         height: number; // Height of the list
//         itemCount: number; // Total number of items
//         itemSize: number; // Fixed height of each item
//         width: number; // Width of the list
//         children: (props: { index: number; style: CSSProperties }) => React.ReactNode; // Function to render items
//         overscanCount?: number; // Number of items to render outside of the visible area (optional)
//     }

//     export const FixedSizeList: ComponentType<FixedSizeListProps>;
// }
declare module 'react-window' {
    import { ComponentType, CSSProperties, ReactNode } from 'react';
  
    interface FixedSizeListProps {
      children: (props: { index: number; style: CSSProperties }) => ReactNode;
      height: number;
      itemCount: number;
      itemSize: number;
      width: number;
      onItemsRendered?: (params: { visibleStartIndex: number; visibleStopIndex: number }) => void;
      innerElementType?: string | ComponentType<any>;
      className?: string;
      style?: CSSProperties;
    }
  
    export const FixedSizeList: ComponentType<FixedSizeListProps>;
  }
  