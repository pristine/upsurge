// 'use client';
// import { Product } from '@/types/product';
// import {
//   Button,
//   Card,
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogRoot,
//   DialogTitle,
//   DialogTrigger,
//   Flex,
//   Inset,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectRoot,
//   SelectTrigger,
//   Strong,
//   Tooltip,
//   Text,
//   TextFieldRoot,
//   TextFieldInput,
// } from 'frosted-ui';
// import Select from 'react-select';
// import { HTMLAttributes, forwardRef, useState } from 'react';
// import { KeyedMutator } from 'swr';
// import { AutoSizer, List } from 'react-virtualized';
// import { FixedSizeList } from 'react-window';
// import { addGroup } from '@/services/group';

// import {
//   DndContext,
//   closestCenter,
//   KeyboardSensor,
//   PointerSensor,
//   useSensor,
//   useSensors,
//   DragOverlay,
// } from '@dnd-kit/core';
// import {
//   arrayMove,
//   SortableContext,
//   sortableKeyboardCoordinates,
//   useSortable,
//   verticalListSortingStrategy,
// } from '@dnd-kit/sortable';

// import reorder from '@/util/reorder';
// import { CSS } from '@dnd-kit/utilities';

// interface Props {
//   companyId: string;
//   products: Product[];
//   refreshProducts: Function;
//   refreshGroups: Function;
// }

// export default function CreateNewGroupModal({
//   companyId,
//   products,
//   refreshProducts,
//   refreshGroups,
// }: Props) {
//   const [isButtonLoading, setIsButtonLoading] = useState(false);

//   const [activeProductId, setActiveProductId] = useState(null);
//   const [selectedProductIds, setSelectedProductIds] = useState([] as string[]);
//   const [name, setName] = useState('');

//   const sensors = useSensors(
//     useSensor(PointerSensor),
//     useSensor(KeyboardSensor, {
//       coordinateGetter: sortableKeyboardCoordinates,
//     })
//   );

//   function handleDragStart(event: any) {
//     const { active } = event;

//     setActiveProductId(active.id);
//   }

//   function handleDragEnd(event: any) {
//     const { active, over } = event;

//     if (active.id !== over.id) {
//       setSelectedProductIds((items) => {
//         const oldIndex = items.indexOf(active.id);
//         const newIndex = items.indexOf(over.id);

//         return arrayMove(items, oldIndex, newIndex);
//       });
//     }

//     setActiveProductId(null);
//   }

//   return (
//     <>
//       <DialogRoot>
//         <DialogTrigger>
//           <Button
//             color="orange"
//             className="hover:scale-105 hover:cursor-pointer transition duration-500"
//             style={{
//               maxWidth: 300,
//             }}
//             size="2"
//             variant="surface"
//           >
//             Setup new group
//           </Button>
//         </DialogTrigger>
//         <DialogContent>
//           <DialogTitle>Setup a new group</DialogTitle>
//           <DialogDescription>
//             Setup the loyalty system on a new group.
//           </DialogDescription>
//           <Flex direction="column" gap="4">
//             <Flex direction="column">
//               <Text weight="bold">Group name</Text>
//               <Text size="1">
//                 Give the group a name you&apos;ll remember and one that relates
//                 to the products!
//               </Text>
//               <TextFieldRoot color="gray" size="2" variant="surface" mt="3">
//                 <TextFieldInput
//                   placeholder="Start typing here..."
//                   maxLength={100}
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                 />
//               </TextFieldRoot>
//             </Flex>
//             <Flex direction="column" gap="1">
//               <Text weight="bold">Select product(s)</Text>
//               <Text size="1">
//                 Have one Discord server with different subscriptions on
//                 different products? Select each of them here to track all in
//                 one!
//               </Text>
//               <Card className="w-full" mt="2">
//                 <Inset clip="border-box" side="all">
//                   <Flex
//                     direction="row"
//                     className="w-full bg-gray-3 border-b-[1px] border-gray-6"
//                     py="2"
//                   >
//                     <div className="grid grid-cols-2 gap-4 w-full px-4">
//                       <div className="col-span-1">
//                         <Text size="1">
//                           <Strong>Product ID</Strong>
//                         </Text>
//                       </div>
//                       <div className="col-span-1">
//                         <Text size="1">
//                           <Strong>Name</Strong>
//                         </Text>
//                       </div>
//                     </div>
//                   </Flex>
//                   <AutoSizer disableHeight>
//                     {({ width }) => (
//                       <List
//                         width={width} // or the width of your container
//                         height={150} // or the height of your container
//                         rowCount={products.length}
//                         rowHeight={33} // or the height of your rows
//                         rowRenderer={({ index, key, style }) => {
//                           const product = products[index];
//                           return (
//                             <div
//                               key={key}
//                               style={style}
//                               onClick={() => {
//                                 if (selectedProductIds.includes(product.id)) {
//                                   setSelectedProductIds(
//                                     selectedProductIds.filter(
//                                       (id) => id !== product.id
//                                     )
//                                   );
//                                 } else {
//                                   setSelectedProductIds([
//                                     ...selectedProductIds,
//                                     product.id,
//                                   ]);
//                                 }
//                               }}
//                               className={`grid grid-cols-2 gap-4 w-full border-b-[1px] border-gray-6 py-1 px-4 hover:cursor-pointer ${
//                                 selectedProductIds.includes(product.id)
//                                   ? 'bg-indigo-5'
//                                   : 'hover:bg-gray-2'
//                               }`}
//                             >
//                               <Tooltip content={product.id}>
//                                 <div className="col-span-1 truncate">
//                                   <Text size="1">{product.id}</Text>
//                                 </div>
//                               </Tooltip>
//                               <Tooltip content={product.name}>
//                                 <div className="col-span-1 truncate">
//                                   <Text size="1">{product.name}</Text>
//                                 </div>
//                               </Tooltip>
//                             </div>
//                           );
//                         }}
//                       />
//                     )}
//                   </AutoSizer>
//                 </Inset>
//               </Card>
//             </Flex>
//             {selectedProductIds.length > 1 && (
//               <Flex direction="column" gap="1">
//                 <Text weight="bold">Product precedence</Text>
//                 <Text size="1">
//                   If a user owns at least 2 of the products you selected, the
//                   product with the highest order is used! (Drag and drop)
//                 </Text>
//                 <Flex direction="column" className="h-[150px] w-full">
//                   <Card className="w-full" mt="2">
//                     <Inset clip="border-box" side="all">
//                       <Flex
//                         direction="row"
//                         className="w-full bg-gray-3 border-b-[1px] border-gray-6"
//                         py="2"
//                       >
//                         <div className="grid grid-cols-2 gap-4 w-full px-4">
//                           <div className="col-span-1">
//                             <Text size="1">
//                               <Strong>Product ID</Strong>
//                             </Text>
//                           </div>
//                           <div className="col-span-1">
//                             <Text size="1">
//                               <Strong>Name</Strong>
//                             </Text>
//                           </div>
//                         </div>
//                       </Flex>
//                       <DndContext
//                         sensors={sensors}
//                         collisionDetection={closestCenter}
//                         onDragStart={handleDragStart}
//                         onDragEnd={handleDragEnd}
//                       >
//                         <SortableContext
//                           items={selectedProductIds}
//                           strategy={verticalListSortingStrategy}
//                         >
//                           <AutoSizer disableHeight>
//                             {({ width }) => (
//                               <FixedSizeList
//                                 width={width}
//                                 height={100}
//                                 itemData={selectedProductIds}
//                                 itemCount={selectedProductIds.length}
//                                 itemSize={33}
//                                 overscanCount={10}
//                               >
//                                 {({ index, style, data: items }: any) => {
//                                   const productId = selectedProductIds[index];
//                                   const product = products.find(
//                                     (product) => product.id === productId
//                                   );
//                                   return (
//                                     <SortableItem
//                                       key={productId}
//                                       id={productId}
//                                       className={`grid grid-cols-2 gap-4 w-full border-b-[1px] border-gray-6 py-1 px-4 hover:cursor-pointer hover:bg-gray-2`}
//                                     >
//                                       <Tooltip content={productId}>
//                                         <div className="col-span-1 truncate">
//                                           <Text size="1">{productId}</Text>
//                                         </div>
//                                       </Tooltip>
//                                       <Tooltip content={product?.name || ''}>
//                                         <div className="col-span-1 truncate">
//                                           <Text size="1">{product?.name}</Text>
//                                         </div>
//                                       </Tooltip>
//                                     </SortableItem>
//                                   );
//                                 }}
//                               </FixedSizeList>
//                             )}
//                           </AutoSizer>
//                         </SortableContext>
//                         <DragOverlay>
//                           {activeProductId ? (
//                             <SortableItem
//                               key={activeProductId}
//                               id={activeProductId}
//                               className={`grid grid-cols-2 gap-4 w-full border-gray-6 py-2 px-4`}
//                             >
//                               <div className="col-span-1 truncate">
//                                 <Text size="2">{activeProductId}</Text>
//                               </div>
//                               <div className="col-span-1 truncate">
//                                 <Text size="2">
//                                   {
//                                     products.find(
//                                       (product) =>
//                                         product.id === activeProductId
//                                     )?.name
//                                   }
//                                 </Text>
//                               </div>
//                             </SortableItem>
//                           ) : null}
//                         </DragOverlay>
//                       </DndContext>
//                     </Inset>
//                   </Card>
//                 </Flex>
//               </Flex>
//             )}
//           </Flex>
//           <Flex gap="3" justify="end" mt="4">
//             <DialogClose>
//               <Button
//                 className="hover:cursor-pointer"
//                 color="gray"
//                 onClick={() => {}}
//                 variant="soft"
//               >
//                 Cancel
//               </Button>
//             </DialogClose>
//             <DialogClose
//               onClick={async () => {
//                 setIsButtonLoading(true);

//                 if (name.length === 0 || selectedProductIds.length === 0) {
//                   // toast.error('You must select a product!');
//                   setIsButtonLoading(false);
//                   return;
//                 }

//                 if (selectedProductIds.length > 1) {
//                   setIsButtonLoading(false);
//                   return;
//                 }

//                 await addGroup(companyId, name, selectedProductIds);
//                 await refreshProducts();
//                 await refreshGroups();

//                 setSelectedProductIds([]);
//                 setName('');
//                 setIsButtonLoading(false);
//               }}
//             >
//               <Button
//                 className="hover:cursor-pointer"
//                 color="success"
//                 disabled={isButtonLoading}
//               >
//                 Setup
//               </Button>
//             </DialogClose>
//           </Flex>
//         </DialogContent>
//       </DialogRoot>
//     </>
//   );
// }

// function SortableItem(props: any) {
//   const { index, style: styleProp, data, isScrolling, ...rest } = props;

//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({ id: props.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   return (
//     <div
//       {...rest}
//       {...attributes}
//       {...listeners}
//       style={style}
//       ref={setNodeRef}
//     ></div>
//   );
// }
