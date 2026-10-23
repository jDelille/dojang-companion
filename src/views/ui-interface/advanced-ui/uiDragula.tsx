import { useState, type ReactNode } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { Move } from "lucide-react";
import ImageWithBasePath from "../../../components/image-with-base-path";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

// The template drives these demos with `dragula`, which is not a dependency
// here. @hello-pangea/dnd (already installed) provides the equivalent
// drag-and-drop behaviour in React idioms, including the handle-only variant.

type ColorBox = {
  id: string;
  className: string;
};

type Person = {
  id: string;
  src: string;
  name: string;
  role: string;
};

const initialBoxes: readonly ColorBox[] = [
  { id: "box-1", className: "p-5 bg-primary rounded-lg text-white" },
  { id: "box-2", className: "p-5 bg-success rounded-lg text-white" },
  { id: "box-3", className: "p-5 bg-warning rounded-lg text-white" },
  { id: "box-4", className: "p-5 bg-danger rounded-lg text-white" },
  { id: "box-5", className: "p-5 bg-info rounded-lg text-white" },
  { id: "box-6", className: "p-5 bg-dark rounded-lg text-white" },
];

const initialLeft: readonly Person[] = [
  {
    id: "person-1",
    src: "/assets/img/avatars/avatar-01.jpg",
    name: "Luoise K. Bond",
    role: "Founder & CEO",
  },
  {
    id: "person-2",
    src: "/assets/img/avatars/avatar-02.jpg",
    name: "James M. Short",
    role: "Software Engineer",
  },
  {
    id: "person-3",
    src: "/assets/img/avatars/avatar-03.jpg",
    name: "Susan J. Sander",
    role: "Web Designer",
  },
];

const initialRight: readonly Person[] = [
  {
    id: "person-4",
    src: "/assets/img/avatars/avatar-04.jpg",
    name: "Dennis N. Cloutier",
    role: "Web Developer",
  },
  {
    id: "person-5",
    src: "/assets/img/avatars/avatar-05.jpg",
    name: "Gabriel J. Snyder",
    role: "Business Analyst",
  },
  {
    id: "person-6",
    src: "/assets/img/avatars/avatar-06.jpg",
    name: "Louie C. Mason",
    role: "Human Resources",
  },
];

const initialHandleLeft: readonly Person[] = [
  {
    id: "handle-1",
    src: "/assets/img/avatars/avatar-07.jpg",
    name: "Luoise K. Bond",
    role: "Founder & CEO",
  },
  {
    id: "handle-2",
    src: "/assets/img/avatars/avatar-08.jpg",
    name: "Dennis N. Cloutier",
    role: "Software Engineer",
  },
  {
    id: "handle-3",
    src: "/assets/img/avatars/avatar-09.jpg",
    name: "Susan J. Sander",
    role: "Web Designer",
  },
];

const initialHandleRight: readonly Person[] = [
  {
    id: "handle-4",
    src: "/assets/img/avatars/avatar-10.jpg",
    name: "Gabriel J. Snyder",
    role: "Web Developer",
  },
  {
    id: "handle-5",
    src: "/assets/img/avatars/avatar-12.jpg",
    name: "James M. Short",
    role: "Business Analyst",
  },
  {
    id: "handle-6",
    src: "/assets/img/avatars/avatar-13.jpg",
    name: "Louie C. Mason",
    role: "Human Resources",
  },
];

const BLURB =
  "Disrupt pork belly poutine, asymmetrical tousled succulents selfies. You probably haven't heard of them tattooed master cleanse live-edge keffiyeh.";

const PreviewCard = ({
  title,
  children,
  code,
}: {
  title: ReactNode;
  children: ReactNode;
  code: string;
}) => (
  <PreviewCodeToggle title={title} code={code} cardShellClassName="preview-card glass-card p-5">
    {children}
  </PreviewCodeToggle>
);

/** Moves an item within one list or across two lists, mirroring dragula's drop. */
const reorder = (
  source: readonly Person[],
  destination: readonly Person[],
  result: DropResult,
): [Person[], Person[]] => {
  const from = [...source];
  const to = source === destination ? from : [...destination];
  const [moved] = from.splice(result.source.index, 1);
  to.splice(result.destination!.index, 0, moved);
  return [from, to];
};

const UiDragula = () => {
  const [boxes, setBoxes] = useState<ColorBox[]>([...initialBoxes]);
  const [left, setLeft] = useState<Person[]>([...initialLeft]);
  const [right, setRight] = useState<Person[]>([...initialRight]);
  const [handleLeft, setHandleLeft] = useState<Person[]>([...initialHandleLeft]);
  const [handleRight, setHandleRight] = useState<Person[]>([
    ...initialHandleRight,
  ]);

  const onBoxesDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const next = [...boxes];
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    setBoxes(next);
  };

  const makePairHandler =
    (
      leftId: string,
      leftList: Person[],
      setLeftList: (value: Person[]) => void,
      rightList: Person[],
      setRightList: (value: Person[]) => void,
    ) =>
    (result: DropResult) => {
      if (!result.destination) return;
      const fromLeft = result.source.droppableId === leftId;
      const toLeft = result.destination.droppableId === leftId;
      const source = fromLeft ? leftList : rightList;
      const destination = toLeft ? leftList : rightList;

      const [nextSource, nextDestination] = reorder(source, destination, result);

      if (fromLeft === toLeft) {
        if (fromLeft) setLeftList(nextSource);
        else setRightList(nextSource);
        return;
      }
      if (fromLeft) {
        setLeftList(nextSource);
        setRightList(nextDestination);
      } else {
        setRightList(nextSource);
        setLeftList(nextDestination);
      }
    };

  const onPeopleDragEnd = makePairHandler(
    "company-list-left",
    left,
    setLeft,
    right,
    setRight,
  );

  const onHandleDragEnd = makePairHandler(
    "handle-dragula-left",
    handleLeft,
    setHandleLeft,
    handleRight,
    setHandleRight,
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Dragula</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-1 gap-6">
        <PreviewCard
          title={
            <h2 className="text-lg font-bold c-text mb-0">
              {" "}
              Simple Drag and Drop Example
            </h2>
          }
          code={`<div class="preview-content grid grid-cols-1 xl:grid-cols-3 gap-6" id="simple-dragula">
	<div class="p-5 bg-primary rounded-lg text-white">
		<p class="mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.</p>
		<p>Someone famous in <em>Source Title</em></p>
	</div>
	<div class="p-5 bg-success rounded-lg text-white">
		<p class="mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.</p>
		<p>Someone famous in <em>Source Title</em></p>
	</div>
	<!-- warning, danger, info, dark boxes follow the same pattern -->
</div>`}
        >
          <DragDropContext onDragEnd={onBoxesDragEnd}>
            <Droppable droppableId="simple-dragula" direction="horizontal">
              {(droppable) => (
                <div
                  ref={droppable.innerRef}
                  {...droppable.droppableProps}
                  className="preview-content grid grid-cols-1 xl:grid-cols-3 gap-6"
                  id="simple-dragula"
                >
                  {boxes.map((box, index) => (
                    <Draggable key={box.id} draggableId={box.id} index={index}>
                      {(draggable) => (
                        <div
                          ref={draggable.innerRef}
                          {...draggable.draggableProps}
                          {...draggable.dragHandleProps}
                          className={box.className}
                        >
                          <p className="mb-4">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Integer posuere erat a ante.
                          </p>
                          <p>
                            Someone famous in <em>Source Title</em>
                          </p>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {droppable.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </PreviewCard>
        {/* end card */}

        <PreviewCard
          title={
            <h3 className="text-lg font-bold c-text mb-0">
              Move stuff between containers
            </h3>
          }
          code={`<div class="preview-content grid grid-cols-1 xl:grid-cols-2 gap-6">
	<div class="col-span-1 p-5 bg-[var(--card2)] rounded-lg">
		<h4 class="text-lg font-bold c-text mb-0">Part 1</h4>
		<div class="flex flex-col gap-4 mt-8" id="company-list-left">
			<div class="flex sm:flex-row flex-col items-start gap-3 p-4 border border-[var(--border)] rounded-lg bg-[var(--card)]">
				<img class="size-10 rounded-full border border-[var(--border)] shrink-0" src="assets/img/avatars/avatar-01.jpg" alt="user-image">
				<div>
					<h5 class="text-[16px] mb-1">Luoise K. Bond</h5>
					<p class="text-xs mb-3">Founder &amp; CEO</p>
					<em class="text-xs">Disrupt pork belly poutine, asymmetrical tousled succulents selfies. You probably haven't heard of them tattooed master cleanse live-edge keffiyeh.</em>
				</div>
			</div>
		</div>
	</div>
	<div class="col-span-1 p-5 bg-[var(--card2)] rounded-lg">
		<h4 class="text-lg font-bold c-text mb-0">Part 2</h4>
		<div class="flex flex-col gap-4 mt-8" id="company-list-right"></div>
	</div>
</div>`}
        >
          <DragDropContext onDragEnd={onPeopleDragEnd}>
            <div className="preview-content grid grid-cols-1 xl:grid-cols-2 gap-6">
              {(
                [
                  ["company-list-left", "Part 1", left],
                  ["company-list-right", "Part 2", right],
                ] as const
              ).map(([droppableId, part, people]) => (
                <div
                  key={droppableId}
                  className="col-span-1 p-5 bg-[var(--card2)] rounded-lg"
                >
                  <h4 className="text-lg font-bold c-text mb-0">{part}</h4>
                  <Droppable droppableId={droppableId}>
                    {(droppable) => (
                      <div
                        ref={droppable.innerRef}
                        {...droppable.droppableProps}
                        className="flex flex-col gap-4 mt-8"
                        id={droppableId}
                      >
                        {people.map((person, index) => (
                          <Draggable
                            key={person.id}
                            draggableId={person.id}
                            index={index}
                          >
                            {(draggable) => (
                              <div
                                ref={draggable.innerRef}
                                {...draggable.draggableProps}
                                {...draggable.dragHandleProps}
                                className="flex sm:flex-row flex-col items-start gap-3 p-4 border border-[var(--border)] rounded-lg bg-[var(--card)]"
                              >
                                <ImageWithBasePath
                                  src={person.src}
                                  className="size-10 rounded-full border border-[var(--border)] shrink-0"
                                  alt="user-image"
                                />
                                <div>
                                  <h5 className="text-[16px] mb-1">
                                    {person.name}
                                  </h5>
                                  <p className="text-xs mb-3">{person.role}</p>
                                  <em className="text-xs">{BLURB}</em>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {droppable.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </PreviewCard>
        {/* end card */}

        <PreviewCard
          title={
            <h5 className="text-lg font-bold c-text mb-0">
              Move stuff between containers using handle
            </h5>
          }
          code={`<div class="preview-content grid grid-cols-1 xl:grid-cols-2 gap-6">
	<div class="col-span-1 p-5 bg-[var(--card2)] rounded-lg">
		<h5 class="text-lg font-bold c-text mb-0">Part 1</h5>
		<div class="flex flex-col gap-4 mt-8" id="handle-dragula-left">
			<div class="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg bg-[var(--card)]">
				<div class="flex flex-wrap items-center gap-2">
					<img class="size-10 rounded-full border border-[var(--border)]" src="assets/img/avatars/avatar-07.jpg" alt="user-image">
					<div>
						<h5 class="text-[16px]">Luoise K. Bond</h5>
						<p class="text-xs">Founder &amp; CEO</p>
					</div>
				</div>
				<span class="dragula-handle"><i class="icon icon-move cursor-move"></i></span>
			</div>
		</div>
	</div>
	<div class="col-span-1 p-5 bg-[var(--card2)] rounded-lg">
		<h5 class="text-lg font-bold c-text mb-0">Part 2</h5>
		<div class="flex flex-col gap-4 mt-8" id="handle-dragula-right"></div>
	</div>
</div>`}
        >
          <DragDropContext onDragEnd={onHandleDragEnd}>
            <div className="preview-content grid grid-cols-1 xl:grid-cols-2 gap-6">
              {(
                [
                  ["handle-dragula-left", "Part 1", handleLeft],
                  ["handle-dragula-right", "Part 2", handleRight],
                ] as const
              ).map(([droppableId, part, people]) => (
                <div
                  key={droppableId}
                  className="col-span-1 p-5 bg-[var(--card2)] rounded-lg"
                >
                  <h5 className="text-lg font-bold c-text mb-0">{part}</h5>
                  <Droppable droppableId={droppableId}>
                    {(droppable) => (
                      <div
                        ref={droppable.innerRef}
                        {...droppable.droppableProps}
                        className="flex flex-col gap-4 mt-8"
                        id={droppableId}
                      >
                        {people.map((person, index) => (
                          <Draggable
                            key={person.id}
                            draggableId={person.id}
                            index={index}
                          >
                            {(draggable) => (
                              <div
                                ref={draggable.innerRef}
                                {...draggable.draggableProps}
                                className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg bg-[var(--card)]"
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <ImageWithBasePath
                                    src={person.src}
                                    className="size-10 rounded-full border border-[var(--border)]"
                                    alt="user-image"
                                  />
                                  <div>
                                    <h5 className="text-[16px]">{person.name}</h5>
                                    <p className="text-xs">{person.role}</p>
                                  </div>
                                </div>
                                <span
                                  {...draggable.dragHandleProps}
                                  className="dragula-handle"
                                >
                                  <Move
                                    className="w-4 h-4 cursor-move"
                                    aria-hidden="true"
                                  />
                                </span>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {droppable.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </PreviewCard>
        {/* end card */}
      </div>
      {/* End grid */}
    </div>
  );
};

export default UiDragula;
