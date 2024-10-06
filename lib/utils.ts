export const getOrigin = (opts?: { split?: boolean }) => {
  const origin = window.location.origin.trimEnd("/");
  if (!opts?.split) {
    return origin;
  }
  return origin.split("://", 2);
};
