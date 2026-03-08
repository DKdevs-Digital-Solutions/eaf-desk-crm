export default function ValidatorPanel({ src, title }) {
  return (
    <iframe
      title={title}
      src={src}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation allow-pointer-lock allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
      allow="camera; microphone; notifications; clipboard"
      className="h-[calc(100dvh-20rem)] min-h-[320px] w-full bg-white"
    />
  );
}
