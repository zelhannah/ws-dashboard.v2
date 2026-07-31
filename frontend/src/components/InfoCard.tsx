import type { ReactNode } from "react";

interface InfoCardProps {
    title: string;
    subtitle?: string;
    icon?: string;
    badge?: ReactNode;
    children: ReactNode;
}

export default function InfoCard({
    title,
    subtitle,
    icon,
    badge,
    children,
}: InfoCardProps) {
    return (
        <div className="info-card">
            <div className="info-card-header">
                <div className="d-flex align-items-center gap-3">
                    {icon && (
                        <div className="info-card-icon">
                            <i className={`bi ${icon}`} />
                        </div>
                    )}

                    <div>
                        <h5>{title}</h5>
                        {subtitle && <small>{subtitle}</small>}
                    </div>
                </div>

                {badge}
            </div>

            <div className="info-card-body">{children}</div>
        </div>
    );
}