export const photos = {
  hero: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2000&q=85',
  hotel: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85',
  room: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85',
  room2: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85',
  family: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85',
  villa: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=85',
  dining: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=85',
  food: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85',
  pool: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?auto=format&fit=crop&w=1400&q=85',
  event: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=85',
  garden: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=85',
  spa: 'https://images.unsplash.com/photo-1540555700478-4be289fbecea?auto=format&fit=crop&w=1200&q=85'
}

export const rooms = [
  { id: 'deluxe-room', name: 'Deluxe Room', type: 'Deluxe', price: 12000, guests: 2, beds: '1 King Bed', view: 'Garden View', image: photos.room, description: 'A calm and welcoming retreat with thoughtful details, warm finishes and everything you need for a relaxing stay.' },
  { id: 'superior-room', name: 'Superior Room', type: 'Superior', price: 15000, guests: 2, beds: '1 King Bed', view: 'Sea View', image: photos.room2, description: 'Enjoy extra space, inviting interiors and beautiful views in a room designed for comfort.' },
  { id: 'family-room', name: 'Family Room', type: 'Family', price: 20000, guests: 4, beds: '2 Beds', view: 'Garden View', image: photos.family, description: 'A spacious stay for families and friends, with room to relax and make memories together.' },
  { id: 'private-villa', name: 'Private Villa', type: 'Villa', price: 25000, guests: 4, beds: '2 Beds', view: 'Garden View', image: photos.villa, description: 'A private retreat surrounded by nature, ideal for guests seeking a little more space and privacy.' }
]

export const offers = [
  { id: 'dining-stay', name: 'Dining & Stay', discount: '20%', image: photos.pool, code: 'DINE15', description: 'Relax, rejuvenate and save with a special stay and dining experience.', details: ['Discount on selected room rates', 'Complimentary welcome drink', 'Special dining menu for lunch or dinner'] },
  { id: 'summer-escape', name: 'Summer Escape', discount: '15%', image: photos.dining, code: 'SUMMER15', description: 'A perfect blend of comfort and cuisine.', details: ['Discount on room rates', 'Complimentary breakfast', 'Access to swimming pool and wellness facilities'] },
  { id: 'family-getaway', name: 'Family Getaway', discount: '25%', image: photos.room2, code: 'FAMILY25', description: 'Make it a family vacation to remember.', details: ['Special rates on selected family rooms', 'Complimentary breakfast for registered guests', 'Kids stay and dine benefits (subject to availability)'] }
]

export const navItems = [
  ['Home', '/'], ['Accommodation', '/accommodation'], ['Dining', '/dining'],
  ['Events', '/events'], ['Gallery', '/gallery'], ['About', '/about'], ['Contact', '/contact']
]