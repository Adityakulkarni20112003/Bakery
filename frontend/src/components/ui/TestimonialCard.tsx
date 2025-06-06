import React from 'react';
import { Testimonial } from '../../types';
import Card from './Card';
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  testimonial: Testimonial;
  className?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial, className = '' }) => {
  return (
    <Card className={`h-full ${className}`}>
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center mb-4">
          <img 
            src={testimonial.avatar} 
            alt={testimonial.name} 
            className="w-12 h-12 rounded-full object-cover mr-4"
          />
          <div>
            <h3 className="font-serif font-semibold text-gray-800">{testimonial.name}</h3>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={`${
                    i < testimonial.rating 
                      ? 'text-accent-600 fill-accent-600' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 italic flex-grow">"{testimonial.comment}"</p>
      </div>
    </Card>
  );
};

export default TestimonialCard;