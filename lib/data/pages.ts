/** Copy for the dining, events and amenities pages, carried over verbatim from the Angular components. */

export type Restaurant = {
  readonly name: string;
  readonly image: string;
  readonly paragraphs: readonly string[];
};

export const RESTAURANTS: readonly Restaurant[] = [
  {
    name: 'Tsavorite Restaurant',
    image: '/image/dining/dining_one.webp',
    paragraphs: [
      'For our esteemed resident guests, we offer a comprehensive room service experience. Enjoy the convenience of having meals and drinks delivered directly to your room. Start your day with a refreshing cup of tea or coffee, available upon request before 7:00am. Our extensive drink menu features both local and international options, ensuring that you find the perfect libation to complement your dining experience. Feel free to indulge in our cocktail drinks, expertly crafted by our skilled bartenders. Unwind and treat yourself to a delightful selection of beverages at our well-stocked Bar, conveniently located on the same floor as the Pool Terrace. Whether you prefer a leisurely meal at the Terrace Restaurant or a refreshing drink at our Bar, Hotel Sapphire invites you to savor every moment. Delight in the flavors, sip on expertly mixed drinks, and allow us to create an unforgettable dining experience for you.',
    ],
  },
  {
    name: 'Mehfil Indian Restaurant',
    image: '/image/dining/dining_two.webp',
    paragraphs: [
      'An authentic Indian restaurant that takes you on a culinary journey through the vibrant flavors of India. We pride ourselves on delivering a truly remarkable dining experience that tantalizes your taste buds and immerses you in the rich cultural tapestry of India.',
      'We believe that Indian cuisine is a celebration of diverse spices, aromatic herbs, and age-old recipes passed down through generations. Our skilled chefs, masters of their craft, meticulously blend traditional techniques with modern culinary innovations to create a symphony of flavors on every plate.',
    ],
  },
];

export type CapacityRow = {
  readonly room: string;
  /** Seats per layout; `null` where the layout isn't offered. */
  readonly uShape: number | null;
  readonly classroom: number | null;
  readonly theater: number | null;
};

export const CAPACITY_CHART: readonly CapacityRow[] = [
  { room: 'Zumaridi', uShape: 60, classroom: 40, theater: 50 },
  { room: 'Shaba', uShape: 80, classroom: 70, theater: 100 },
  { room: 'Almasi', uShape: null, classroom: 200, theater: 250 },
];

export type AmenityIcon = 'pool' | 'dining' | 'meetings' | 'wifi' | 'room-service' | 'parking';

export type Amenity = {
  readonly icon: AmenityIcon;
  readonly title: string;
  readonly text: string;
};

export const AMENITIES: readonly Amenity[] = [
  {
    icon: 'pool',
    title: 'Swimming Pool',
    text: 'Relax and refresh in our beautifully maintained swimming pool. Located on the terrace level, it offers a peaceful escape from the city bustle.',
  },
  {
    icon: 'dining',
    title: 'Dining & Drinks',
    text: 'From our Roshani Restaurant to the well-stocked bar, enjoy a wide selection of local and international flavors.',
  },
  {
    icon: 'meetings',
    title: 'Meeting Rooms',
    text: '4 modern conference halls equipped with high-speed internet and AV support for all your corporate needs.',
  },
  {
    icon: 'wifi',
    title: 'Free High-Speed Wi-Fi',
    text: 'Stay connected throughout your stay with complimentary high-speed internet access in all rooms and public areas.',
  },
  {
    icon: 'room-service',
    title: '24/7 Room Service',
    text: 'Enjoy the convenience of delicious meals and refreshments delivered directly to your room at any time.',
  },
  {
    icon: 'parking',
    title: 'Secure Parking',
    text: 'We provide ample and secure parking space for all our guests, ensuring peace of mind during your stay.',
  },
];
