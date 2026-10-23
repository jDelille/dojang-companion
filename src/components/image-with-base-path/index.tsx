/* eslint-disable @next/next/no-img-element */
import React, { type ImgHTMLAttributes } from "react";
import { image_path } from "../../environment";

export type ImageWithBasePathProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
};

const ImageWithBasePath = ({ src, alt = "", ...rest }: ImageWithBasePathProps) => (
  <img src={`${image_path}${src}`} alt={alt} {...rest} />
);

export default React.memo(ImageWithBasePath);
