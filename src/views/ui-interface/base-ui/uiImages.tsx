import ImageWithBasePath from "../../../components/image-with-base-path";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

type ImageDemo = {
  title: string;
  cardClassName: string;
  contentClassName?: string;
  src: string;
  imgClassName: string;
  code: string;
};

const imageDemos: ImageDemo[] = [
  {
    title: "Rounded Image",
    cardClassName: "md:col-span-6 sm:col-span-6 col-span-12",
    src: "assets/img/card/card-02.jpg",
    imgClassName: "rounded-lg",
    code: `<ImageWithBasePath class="rounded-lg" src="assets/img/card/card-02.jpg" alt="image">`,
  },
  {
    title: "Image Thumbnail",
    cardClassName: "md:col-span-6 sm:col-span-6 col-span-12",
    src: "assets/img/card/card-02.jpg",
    imgClassName: "border-4 border-[var(--border)] rounded-lg",
    code: `<ImageWithBasePath class="border-2 border-[var(--border)] rounded-lg" src="assets/img/card/card-02.jpg" alt="image">`,
  },
  {
    title: "Rounded Circle",
    cardClassName: "md:col-span-6 sm:col-span-6 col-span-12",
    contentClassName: "flex items-center justify-center",
    src: "assets/img/avatars/avatar-01.jpg",
    imgClassName: "rounded-full w-50",
    code: `<div class="flex items-center justify-center">
	<ImageWithBasePath class="rounded-full w-50" src="assets/img/avatars/avatar-01.jpg" alt="image">
</div>`,
  },
  {
    title: "Rounded Bordered",
    cardClassName: "md:col-span-6 sm:col-span-6 col-span-12",
    contentClassName: "flex items-center justify-center",
    src: "assets/img/avatars/avatar-03.jpg",
    imgClassName: "rounded-full border-4 border-[var(--border)] w-50",
    code: `<div class="flex items-center justify-center">
	<ImageWithBasePath class="rounded-full border-2 border-[var(--border)] w-50" src="assets/img/avatars/avatar-01.jpg" alt="image">
</div>`,
  },
  {
    title: "Image Left Align",
    cardClassName: "sm:col-span-6 col-span-12",
    src: "assets/img/card/card-02.jpg",
    imgClassName: "rounded-lg w-46",
    code: `<ImageWithBasePath class="rounded-lg w-46" src="assets/img/card/card-02.jpg" alt="image">`,
  },
  {
    title: "Image Center Align",
    cardClassName: "sm:col-span-6 col-span-12",
    contentClassName: "flex items-center justify-center",
    src: "assets/img/card/card-02.jpg",
    imgClassName: "rounded-lg w-46",
    code: `<div class="flex items-center justify-center">
	<ImageWithBasePath class="rounded-lg w-46" src="assets/img/card/card-02.jpg" alt="image">
</div>`,
  },
  {
    title: "Image Right Align",
    cardClassName: "xl:col-span-6 sm:col-span-12 col-span-12",
    contentClassName: "flex items-end justify-end",
    src: "assets/img/card/card-02.jpg",
    imgClassName: "rounded-lg w-46",
    code: `<div class="flex items-end justify-end">
	<ImageWithBasePath class="rounded-lg w-46" src="assets/img/card/card-02.jpg" alt="image">
</div>`,
  },
];

const figureAlignments: string[] = ["text-start", "text-center", "text-end"];

const UiImages = () => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Image</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-12 gap-6 items-baseline">
        {imageDemos.map((demo) => (
          <PreviewCodeToggle
            key={demo.title}
            title={demo.title}
            cardClassName={demo.cardClassName}
            contentClassName={demo.contentClassName}
            codeMaxHeightClassName="max-h-[250px]"
            code={demo.code}
          >
            <ImageWithBasePath className={demo.imgClassName} src={demo.src} alt="img" />
          </PreviewCodeToggle>
        ))}
        {/* end card */}

        <PreviewCodeToggle
          title="Figures"
          cardClassName="col-span-12"
          contentClassName="grid grid-cols-1 sm:grid-cols-3 gap-6"
          codeMaxHeightClassName="max-h-[250px]"
          code={`<div class="flex gap-6">
	<div>
		<ImageWithBasePath class="rounded-lg w-auto mb-2" src="assets/img/card/card-02.jpg" alt="image">
		<p class="text-start">A caption for the above image.</p>
	</div>

	<div>
		<ImageWithBasePath class="rounded-lg w-auto mb-2" src="assets/img/card/card-02.jpg" alt="image">
		<p class="text-center">A caption for the above image.</p>
	</div>

	<div>
		<ImageWithBasePath class="rounded-lg w-auto mb-2" src="assets/img/card/card-02.jpg" alt="image">
		<p class="text-end">A caption for the above image.</p>
	</div>
</div>`}
        >
          {figureAlignments.map((alignment) => (
            <div key={alignment}>
              <ImageWithBasePath
                className="rounded-lg w-auto mb-2"
                src="assets/img/card/card-02.jpg"
                alt="img"
              />
              <p className={alignment}>A caption for the above image.</p>
            </div>
          ))}
        </PreviewCodeToggle>
        {/* end card */}
      </div>
      {/* End grid */}
    </div>
  );
};

export default UiImages;
