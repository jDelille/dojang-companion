import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import ImageWithBasePath from "../../../components/image-with-base-path";
import { image_path } from "../../../environment";
import PreviewCodeToggle from "../../../components/preview-code-toggle/PreviewCodeToggle";

type Slide = {
  src: string;
  alt: string;
  title?: string;
  description?: string;
};

const plainSlides: readonly Slide[] = [
  { src: "/assets/img/card/card-01.jpg", alt: "img" },
  { src: "/assets/img/card/card-02.jpg", alt: "img" },
  { src: "/assets/img/card/card-03.jpg", alt: "img" },
];

const describedSlides: readonly Slide[] = [
  {
    src: "/assets/img/card/card-04.jpg",
    alt: "work-thumbnail",
    title: "Title 01",
    description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit",
  },
  {
    src: "/assets/img/card/card-05.jpg",
    alt: "work-thumbnail",
    title: "Title 02",
    description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit",
  },
  {
    src: "/assets/img/card/card-06.jpg",
    alt: "work-thumbnail",
    title: "Title 03",
    description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit",
  },
];

const toLightboxSlides = (slides: readonly Slide[]) =>
  slides.map((slide) => ({
    src: `${image_path}${slide.src}`,
    title: slide.title,
    description: slide.description,
  }));

const PLAIN_CODE = `<div class="preview-content grid grid-cols-1 sm:grid-cols-3 gap-4">
	<button type="button" class="image-popup cursor-pointer">
		<img class="h-full rounded-md" src="assets/img/card/card-01.jpg" alt="img">
	</button>
	<button type="button" class="image-popup cursor-pointer">
		<img class="h-full rounded-md" src="assets/img/card/card-02.jpg" alt="img">
	</button>
	<button type="button" class="image-popup cursor-pointer">
		<img class="h-full rounded-md" src="assets/img/card/card-03.jpg" alt="img">
	</button>
</div>`;

const DESCRIBED_CODE = `<div class="preview-content grid grid-cols-1 sm:grid-cols-3 gap-4">
	<button type="button" class="image-popup-desc cursor-pointer">
		<img class="img-fluid rounded-md" src="assets/img/card/card-04.jpg" alt="work-thumbnail">
	</button>
	<button type="button" class="image-popup-desc cursor-pointer">
		<img class="img-fluid rounded-md" src="assets/img/card/card-05.jpg" alt="work-thumbnail">
	</button>
	<button type="button" class="image-popup-desc cursor-pointer">
		<img class="img-fluid rounded-md" src="assets/img/card/card-06.jpg" alt="work-thumbnail">
	</button>
</div>`;

const UiLightbox = () => {
  const [openPlain, setOpenPlain] = useState(false);
  const [openDescribed, setOpenDescribed] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 lg:mb-6">
        <h1 className="text-xl font-black c-text mb-0">Lightbox</h1>
      </div>

      {/* Start grid */}
      <div className="grid grid-cols-12 gap-6">
        <PreviewCodeToggle
          title={<h2 className="text-lg font-bold c-text mb-0">Single Image Lightbox</h2>}
          code={PLAIN_CODE}
          cardShellClassName="preview-card col-span-12 bg-[var(--card)] rounded-md border border-[var(--border)] p-5"
        >
          <div className="preview-content grid grid-cols-1 sm:grid-cols-3 gap-4">
            {plainSlides.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                className="image-popup cursor-pointer"
                onClick={() => {
                  setIndex(i);
                  setOpenPlain(true);
                }}
              >
                <ImageWithBasePath
                  src={slide.src}
                  alt={slide.alt}
                  className="h-full rounded-md"
                />
              </button>
            ))}
          </div>
        </PreviewCodeToggle>
        {/* end card */}

        <PreviewCodeToggle
          title={<h3 className="text-lg font-bold c-text mb-0">Image with Description</h3>}
          code={DESCRIBED_CODE}
          cardShellClassName="preview-card col-span-12 bg-[var(--card)] rounded-md border border-[var(--border)] p-5"
        >
          <div className="preview-content grid grid-cols-1 sm:grid-cols-3 gap-4">
            {describedSlides.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                className="image-popup-desc cursor-pointer"
                onClick={() => {
                  setIndex(i);
                  setOpenDescribed(true);
                }}
              >
                <ImageWithBasePath
                  src={slide.src}
                  className="img-fluid rounded-md"
                  alt={slide.alt}
                />
              </button>
            ))}
          </div>
        </PreviewCodeToggle>
        {/* end card */}
      </div>
      {/* End grid */}

      <Lightbox
        open={openPlain}
        close={() => setOpenPlain(false)}
        index={index}
        on={{ view: ({ index: current }) => setIndex(current) }}
        slides={toLightboxSlides(plainSlides)}
      />

      <Lightbox
        open={openDescribed}
        close={() => setOpenDescribed(false)}
        index={index}
        on={{ view: ({ index: current }) => setIndex(current) }}
        plugins={[Captions]}
        slides={toLightboxSlides(describedSlides)}
      />
    </div>
  );
};

export default UiLightbox;
