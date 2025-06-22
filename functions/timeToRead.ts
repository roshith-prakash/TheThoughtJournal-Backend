// Get the number of words inside the content and divide them to get the number of minutes required to read the post.
export const getMinsToRead = (value: string | undefined) => {
  return Math.ceil(
    String(value)
      .replace(/<(.|\n)*?>/g, "")
      .trim()
      .split(/\s+/).length / 200
  );
};
