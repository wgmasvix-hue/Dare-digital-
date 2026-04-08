import { motion } from 'motion/react';

const images = [
  { id: 1, src: "https://picsum.photos/seed/library1/400/300", title: "Digital Archives" },
  { id: 2, src: "https://picsum.photos/seed/library2/400/300", title: "Research Hub" },
  { id: 3, src: "https://picsum.photos/seed/library3/400/300", title: "AI Learning" },
  { id: 4, src: "https://picsum.photos/seed/library4/400/300", title: "Global Access" },
];

export default function AnimatedPictureGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {images.map((image, index) => (
        <motion.div
          key={image.id}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="relative overflow-hidden rounded-2xl shadow-md group"
        >
          <img
            src={image.src}
            alt={image.title}
            className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <p className="text-white font-bold text-lg">{image.title}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
