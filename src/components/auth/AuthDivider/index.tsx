interface AuthDividerProps {
  text?: string;
}

export const AuthDivider = ({ text = "Or" }: AuthDividerProps) => (
  <div className="relative my-6">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-white" />
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="px-2 bg-white text-black">{text}</span>
    </div>
  </div>
);
