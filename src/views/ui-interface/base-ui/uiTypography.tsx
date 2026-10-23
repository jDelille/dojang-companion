import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

type DisplayHeading = {
  label: string;
  className: string;
};

const displayHeadings: DisplayHeading[] = [
  { label: "Display 1", className: "text-[64px] max-md:text-6xl" },
  { label: "Display 2", className: "text-[56px] max-md:text-5xl" },
  { label: "Display 3", className: "text-[48px] max-md:text-4xl" },
  { label: "Display 4", className: "text-[36px] max-md:text-3xl" },
  { label: "Display 5", className: "text-[24px] max-md:text-xl" },
  { label: "Display 6", className: "text-[18px] max-md:text-base" },
];

const UiTypography = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Typography</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-12 gap-6">
        <PreviewCodeToggle
          title="Display Headings"
          cardClassName="lg:col-span-6 col-span-12 flex flex-col h-full"
          contentClassName="flex flex-col gap-2 flex-1"
          codeMaxHeightClassName="max-h-[250px]"
          code={`<div class="flex flex-col gap-2">
	<h1 class="text-[64px]">Display 1</h1>
	<h1 class="text-[56px]">Display 2</h1>
	<h1 class="text-[48px]">Display 3</h1>
	<h1 class="text-[36px]">Display 4</h1>
	<h1 class="text-[24px]">Display 5</h1>
	<h1 class="text-[18px]">Display 6</h1>
</div>`}
        >
          {displayHeadings.map((heading) => (
            <h1 key={heading.label} className={heading.className}>
              {heading.label}
            </h1>
          ))}
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title="Headings"
          cardClassName="lg:col-span-6 col-span-12 flex flex-col h-full"
          contentClassName="flex flex-col gap-2 flex-1"
          codeMaxHeightClassName="max-h-[250px]"
          code={`<div class="flex flex-col gap-2">
	<h1>Heading 1</h1>
	<h2>Heading 2</h2>
	<h3>Heading 3</h3>
	<h4>Heading 4</h4>
	<h5>Heading 5</h5>
	<h6>Heading 6</h6>
</div>`}
        >
          <h1>Heading 1</h1>
          <h2>Heading 2</h2>
          <h3>Heading 3</h3>
          <h4>Heading 4</h4>
          <h5 className="text-lg font-bold c-text mb-0">Heading 5</h5>
          <h6>Heading 6</h6>
        </PreviewCodeToggle>
        {/* end card */}
      </div>
      {/* End grid */}
    </div>
  );
};

export default UiTypography;
