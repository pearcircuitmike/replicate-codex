import { Image } from "@chakra-ui/react";

export default function PreviewImage({ src }) {
  const imageUrl =
    src !== ""
      ? src
      : "https://upload.wikimedia.org/wikipedia/commons/d/dc/No_Preview_image_2.png";

  return <Image src={imageUrl} alt="AI model preview image" mb="8" />;
}
