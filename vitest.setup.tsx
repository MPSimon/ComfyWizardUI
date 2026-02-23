import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => {
    const imageProps = { ...props };
    delete imageProps.fill;

    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={props.alt} {...imageProps} />;
  },
}));
