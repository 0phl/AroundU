import 'leaflet';

declare module 'leaflet' {
  namespace Routing {
    interface RoutingControlOptions {
      waypoints: L.LatLng[];
      routeWhileDragging?: boolean;
      showAlternatives?: boolean;
      fitSelectedRoutes?: boolean;
      lineOptions?: {
        styles?: {
          color: string;
          weight: number;
        }[];
      };
      createMarker?: (i: number, waypoint: any, n: number) => L.Marker | null;
    }

    function control(options: RoutingControlOptions): L.Routing.Control;
  }

  interface Routing {
    Control: any;
  }
} 