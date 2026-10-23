import { useState, type ReactNode } from "react";
import CommonSelect, {

  type Option,
} from "../../../components/common-select/commonSelect";
import MultipleSelect from "../../../components/multiple-Select/multipleSelect";
import CommonTagInputs from "../../../components/common-tag-input/commonTagInputs";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

/*
   Ported from tailwind/src/form-select2.html. The template drives these with
   Choices.js; the app's PrimeReact-backed shared selects replace it.
*/

const toOptions = (labels: string[]): Option[] =>
  labels.map((label) => ({ label, value: label }));

const CITY_OPTIONS = toOptions([
  "Madrid",
  "Toronto",
  "Vancouver",
  "London",
  "Manchester",
  "Liverpool",
  "Paris",
  "Malaga",
  "Washington",
  "Lyon",
  "Marseille",
  "Hamburg",
  "Munich",
  "Barcelona",
  "Berlin",
  "Montreal",
  "New York",
  "Michigan",
]);

const NUMBER_OPTIONS = toOptions(["Zero", "One", "Two", "Three", "Four", "Five", "Six"]);

const CHOICE_OPTIONS = toOptions(["Choice 1", "Choice 2", "Choice 3", "Choice 4"]);

const FIELD_LABEL = "block text-sm font-medium mb-2 c-text";
const FIELD_COL = "col-span-12 sm:col-span-6";

const PreviewCard = ({
  title,
  children,
  code,
}: {
  title: string;
  children: ReactNode;
  code: string;
}) => (
  <PreviewCodeToggle
    title={title}
    code={code}
    cardShellClassName="preview-card glass-card p-5"
    contentClassName="grid grid-cols-12 gap-5"
  >
    {children}
  </PreviewCodeToggle>
);

const FormSelect2 = () => {
  const [multiple, setMultiple] = useState<string[]>(["Choice 1"]);
  const [tasks, setTasks] = useState<string[]>(["Task 1"]);
  const [projects, setProjects] = useState<string[]>(["Project A", "Project B"]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Form Select</h1>
      </div>

      {/* Start Grid */}
      <div className="grid grid-cols-1 gap-6">
        <PreviewCard
          title="Choices"
          code={`<div class="col-span-12 sm:col-span-6">
	<label for="choices-single-no-sorting" class="block text-sm font-medium mb-2 c-text">Default</label>
	<select id="choices-single-no-sorting" class="js-choice" data-placeholder="Select a city">
		<option value="Madrid" selected>Madrid</option>
		<option value="Toronto">Toronto</option>
		<option value="Vancouver">Vancouver</option>
		<!-- more city options -->
	</select>
</div>
<div class="col-span-12 sm:col-span-6">
	<label for="choices-single-no-search" class="block text-sm font-medium mb-2 c-text">Options added</label>
	<select id="choices-single-no-search" class="js-choice" data-placeholder="Select an option">
		<option value="Zero" selected>Zero</option>
		<option value="One">One</option>
		<!-- more number options -->
	</select>
</div>
<div class="col-span-12 sm:col-span-6">
	<label for="choices-multiple-remove-button" class="block text-sm font-medium mb-2 c-text">Multiple Select With Remove</label>
	<select id="choices-multiple-remove-button" class="js-choice" multiple data-placeholder="Select choices">
		<option value="Choice 1" selected>Choice 1</option>
		<option value="Choice 2">Choice 2</option>
		<option value="Choice 3">Choice 3</option>
		<option value="Choice 4">Choice 4</option>
	</select>
</div>
<div class="col-span-12 sm:col-span-6">
	<label for="choices-text-remove-button" class="block text-sm font-medium mb-2 c-text">Text Inputs With Remove</label>
	<input type="text" id="choices-text-remove-button" class="js-choice-tags" value="Task 1" placeholder="Add a task">
</div>
<div class="col-span-12 sm:col-span-6">
	<label for="choices-text-unique-values" class="block text-sm font-medium mb-2 c-text">Text Inputs Add</label>
	<input type="text" id="choices-text-unique-values" class="js-choice-tags" value="Project A,Project B" placeholder="Add a project">
</div>`}
        >
          <div className={FIELD_COL}>
            <label htmlFor="choices-single-no-sorting" className={FIELD_LABEL}>
              Default
            </label>
            <CommonSelect
              options={CITY_OPTIONS}
              defaultValue={CITY_OPTIONS[0]}
              placeholder="Select a city"
              ariaLabel="Default select"
            />
          </div>

          <div className={FIELD_COL}>
            <label htmlFor="choices-single-no-search" className={FIELD_LABEL}>
              Options added
            </label>
            <CommonSelect
              options={NUMBER_OPTIONS}
              defaultValue={NUMBER_OPTIONS[0]}
              placeholder="Select an option"
              ariaLabel="Options added"
            />
          </div>

          <div className={FIELD_COL}>
            <label htmlFor="choices-multiple-remove-button" className={FIELD_LABEL}>
              Multiple Select With Remove
            </label>
            <MultipleSelect
              options={CHOICE_OPTIONS}
              value={multiple}
              onChange={setMultiple}
              placeholder="Select choices"
              ariaLabel="Multiple select with remove"
            />
          </div>

          <div className={FIELD_COL}>
            <label htmlFor="choices-text-remove-button" className={FIELD_LABEL}>
              Text Inputs With Remove
            </label>
            <CommonTagInputs
              value={tasks}
              onTagsChange={setTasks}
              placeholder="Add a task"
              ariaLabel="Text inputs with remove"
            />
          </div>

          <div className={FIELD_COL}>
            <label htmlFor="choices-text-unique-values" className={FIELD_LABEL}>
              Text Inputs Add
            </label>
            <CommonTagInputs
              value={projects}
              onTagsChange={setProjects}
              placeholder="Add a project"
              ariaLabel="Text inputs add"
            />
          </div>
        </PreviewCard>
      </div>
      {/* End grid */}
    </div>
  );
};

export default FormSelect2;
