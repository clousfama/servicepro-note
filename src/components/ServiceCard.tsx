import React from 'react';
import { Scissors } from 'lucide-react';

interface ServiceCardProps {
  title: string;
  price: string;
  description: string;
  onClick: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  price,
  description,
  onClick,
}) => {
  return (
    <div 
      onClick={onClick}
      className="bg-woodDark border border-woodGold rounded-lg p-6 hover:bg-opacity-80 transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-woodGold">{title}</h3>
        <Scissors className="text-woodGold w-6 h-6" />
      </div>
      <p className="text-gray-300 mb-4">{description}</p>
      <p className="text-2xl font-bold text-woodGold">{price}</p>
    </div>
  );
};