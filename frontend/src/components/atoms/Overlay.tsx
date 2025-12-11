type OverlayProps = {
    show: boolean;
    children: React.ReactNode;
}

export function Overlay({ show, children }: OverlayProps) {
    return (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${show ? 'block' : 'hidden'}`}>
            {children}
        </div>
    )
}