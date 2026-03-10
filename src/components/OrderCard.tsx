import React from 'react';
import { CheckCircle, X } from 'lucide-react';

type WorkOrder = {
    id: string;
    client: string;
    branch: string;
    status: 'Programada' | 'En Proceso' | 'Completada' | 'Cancelada';
    address: string;
    date: string;
    priority: string;
    type: 'Levantamiento' | 'Instalación';
    instructions?: string[];
};

interface OrderCardProps {
    order: WorkOrder;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
    return (
        <div className="bg-slate-900/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white">{order.id}</h3>
                    <p className="text-sm text-gray-400">{order.client} – {order.branch}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                        {order.priority}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-600/20 text-emerald-400">
                        {order.status}
                    </span>
                </div>
            </div>
            <p className="text-sm text-gray-300 mb-2">{order.address}</p>
            <p className="text-sm text-gray-300 mb-4">{order.date} – {order.type}</p>
            {order.instructions && order.instructions.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-200 mb-2">Protocolo de Acción</h4>
                    <ul className="space-y-1">
                        {order.instructions.map((inst, idx) => (
                            <li key={idx} className="flex items-center space-x-2 text-sm text-gray-400">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                <span>{inst}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
