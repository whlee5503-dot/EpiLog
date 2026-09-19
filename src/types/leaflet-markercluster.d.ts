// Minimal ambient type declarations for leaflet.markercluster.
// We intentionally avoid depending on @types/leaflet.markercluster (existence/
// compatibility with this project's leaflet version was not verified) and
// instead declare only the small surface this app actually uses.

declare module 'leaflet.markercluster';

import * as L from 'leaflet';

declare module 'leaflet' {
    interface MarkerClusterGroupOptions extends L.LayerOptions {
        maxClusterRadius?: number;
        spiderfyOnMaxZoom?: boolean;
        showCoverageOnHover?: boolean;
        chunkedLoading?: boolean;
    }

    class MarkerClusterGroup extends L.FeatureGroup {
        constructor(options?: MarkerClusterGroupOptions);
        addLayer(layer: L.Layer): this;
    }

    function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
}