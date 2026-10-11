import { z } from 'zod';

export const CoordinateSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  altitude: z.number().optional(),
  timestamp: z.number(),
  speed: z.number().optional(),
});

export const WaypointSchema = z.object({
  id: z.string(),
  coordinate: CoordinateSchema,
  type: z.enum(['photo', 'fuel', 'note']),
  imageUrl: z.string().optional(),
  note: z.string().optional(),
});

export const BikeSchema = z.object({
  id: z.string(),
  make: z.string(),
  model: z.string(),
  year: z.number(),
  nickname: z.string().optional(),
  color: z.string(),
  totalMileage: z.number(),
  imageUrl: z.string().optional(),
});

export const RideSchema = z.object({
  id: z.string(),
  bikeId: z.string(),
  startTime: z.number(),
  endTime: z.number().optional(),
  totalDistance: z.number(), // in miles/km
  maxSpeed: z.number(),
  avgSpeed: z.number(),
  maxLeanAngle: z.number(),
  route: z.array(CoordinateSchema),
  waypoints: z.array(WaypointSchema),
  weather: z.object({
    temperature: z.number(),
    condition: z.string(),
  }).optional(),
  syncStatus: z.enum(['pending', 'syncing', 'synced', 'error']).default('pending'),
});

export type Coordinate = z.infer<typeof CoordinateSchema>;
export type Waypoint = z.infer<typeof WaypointSchema>;
export type Bike = z.infer<typeof BikeSchema>;
export type Ride = z.infer<typeof RideSchema>;
