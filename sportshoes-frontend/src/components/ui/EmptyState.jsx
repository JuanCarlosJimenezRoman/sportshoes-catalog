import { InboxIcon } from '@heroicons/react/24/outline';

export default function EmptyState({ title = 'No hay elementos', description = 'No se encontraron resultados', icon: Icon = InboxIcon }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="h-8 w-8 text-[#999999]" />
      </div>
      <h3 className="text-lg font-semibold text-[#1A1A1A]">{title}</h3>
      <p className="mt-1 text-sm text-[#666666]">{description}</p>
    </div>
  );
}