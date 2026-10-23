import TextEditor from "../../../components/text-editor/texteditor";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

/*
   Ported from tailwind/src/form-editors.html. The template mounts Quill on two
   static divs (snow + bubble); the shared TextEditor wraps react-quill-new and
   accepts the same seed HTML.
*/

const EDITOR_CONTENT = `<h3><span class="ql-size-large">Hello World!</span></h3>
<p><br></p>
<h3>This is an simple editable area.</h3>
<p><br></p>
<ol>
  <li>Select a text to reveal the toolbar.</li>
  <li>Edit rich document on-the-fly, so elastic!</li>
</ol>
<p><br></p>
<p>End of simple area</p>`;

const SNOW_CODE = `<div class="h-50!" id="snow-editor">
	<h3><span class="ql-size-large">Hello World!</span></h3>
	<p><br></p>
	<h3>This is an simple editable area.</h3>
	<p><br></p>
	<ol>
		<li>Select a text to reveal the toolbar.</li>
		<li>Edit rich document on-the-fly, so elastic!</li>
	</ol>
	<p><br></p>
	<p>End of simple area</p>
</div>`;

const BUBBLE_CODE = `<div id="bubble-editor" class="border border-[var(--border)] h-65! rounded-md">
	<h3><span class="ql-size-large">Hello World!</span></h3>
	<p><br></p>
	<h3>This is an simple editable area.</h3>
	<p><br></p>
	<ol>
		<li>Select a text to reveal the toolbar.</li>
		<li>Edit rich document on-the-fly, so elastic!</li>
	</ol>
	<p><br></p>
	<p> End of simple area </p>
</div>`;

const FormEditors = () => (
  <div>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
      <h1 className="text-xl font-black c-text mb-0">Form Editors</h1>
    </div>

    {/* State grid */}
    <div className="grid grid-cols-1 gap-6">
      <PreviewCodeToggle title="Quill Editor" code={SNOW_CODE}>
        <TextEditor
          theme="snow"
          value={EDITOR_CONTENT}
          minHeight="220px"
          ariaLabel="Quill editor"
        />
      </PreviewCodeToggle>

      <PreviewCodeToggle
        title="Quill Bubble Editor"
        contentClassName="border border-[var(--border)] rounded-md"
        code={BUBBLE_CODE}
      >
        <TextEditor
          theme="bubble"
          value={EDITOR_CONTENT}
          minHeight="288px"
          ariaLabel="Quill bubble editor"
        />
      </PreviewCodeToggle>
    </div>
    {/* End grid */}
  </div>
);

export default FormEditors;
