import { CircleCheck } from "lucide-react";

type ToastProps = {
  message: string;
  visible: boolean;
};

const Toast = ({ message, visible }: ToastProps) => (
  <div id="toast" className={visible ? "show" : ""} role="status" aria-live="polite">
    <CircleCheck className="w-4 h-4 c-gold" aria-hidden="true" />
    <span id="toast-msg">{message}</span>
  </div>
);

export default Toast;
