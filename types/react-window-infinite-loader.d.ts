// // app/types/react-window-infinite-loader.d.ts
// declare module 'react-window-infinite-loader' {
//     import { ComponentType } from 'react';

//     interface InfiniteLoaderProps {
//         isItemLoaded: (index: number) => boolean;
//         loadMoreItems: (startIndex: number, stopIndex: number) => Promise<void>;
//         itemCount: number;
//         threshold?: number; // Optional prop for loading threshold
//         children: (props: { onItemsRendered: (params: { startIndex: number; stopIndex: number }) => void; isLoading: boolean }) => JSX.Element;
//     }

//     const InfiniteLoader: ComponentType<InfiniteLoaderProps>;
//     export default InfiniteLoader;
// }
declare module 'react-window-infinite-loader' {
    import { ComponentType, ReactNode } from 'react';
  
    interface InfiniteLoaderProps {
      isItemLoaded: (index: number) => boolean;
      itemCount: number;
      loadMoreItems: (startIndex: number, stopIndex: number) => Promise<void>;
      children: (args: {
        onItemsRendered: (params: { startIndex: number; stopIndex: number }) => void;
        ref: any;
      }) => ReactNode;
    }
  
    const InfiniteLoader: ComponentType<InfiniteLoaderProps>;
  
    export default InfiniteLoader;
  }
  