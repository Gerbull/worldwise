import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
	MapContainer,
	Marker,
	Popup,
	TileLayer,
	useMap,
	useMapEvent,
} from 'react-leaflet';
import styles from './Map.module.css';
import { useCities } from '../contexts/CitiesContext';
import { useGeolocation } from '../hooks/useGeolocation';
import Button from './Button';
import { useUrlPosition } from '../hooks/useUrlPosition';

function Map() {
	const { cities } = useCities();
	const [mapPosition, setMapPosition] = useState([55.537505, 37.491234]);
	const {
		isLoading: isLoadingPosition,
		position: geolocationPosition,
		getPosition,
	} = useGeolocation();
	const [mapLat, mapLng] = useUrlPosition();

	useEffect(
		function () {
			if (mapLat && mapLng) setMapPosition([mapLat, mapLng]);
		},
		[mapLat, mapLng]
	);

	useEffect(
		function () {
			if (geolocationPosition)
				setMapPosition([geolocationPosition.lat, geolocationPosition.lng]);
		},
		[geolocationPosition]
	);

	const flagEmojiToPNG = (flag) => {
		const countryCode = Array.from(flag, (codeUnit) => codeUnit.codePointAt())
			.map((char) => String.fromCharCode(char - 127397).toLowerCase())
			.join('');
		return (
			<img src={`https://flagcdn.com/24x18/${countryCode}.png`} alt="flag" />
		);
	};

	return (
		<div className={styles.mapContainer}>
			{!geolocationPosition && (
				<Button type="position" onClick={getPosition}>
					{isLoadingPosition ? 'Loading...' : 'Use your position'}
				</Button>
			)}
			<MapContainer
				className={styles.map}
				center={mapPosition}
				// center={[mapLat, mapLng]}
				zoom={6}
				scrollWheelZoom={true}>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
				/>
				{cities.map((city) => (
					<Marker position={mapPosition} key={city.id}>
						<Popup>
							<span>{city.emoji ? flagEmojiToPNG(city.emoji) : ''}</span>
							<span>{city.cityName}</span>
						</Popup>
					</Marker>
				))}
				<ChangeCenter position={mapPosition} />
				<DetectClick />
			</MapContainer>
		</div>
	);
}

function ChangeCenter({ position }) {
	const map = useMap();
	map.setView(position);
	return null;
}

function DetectClick() {
	const navigate = useNavigate();

	useMapEvent({
		click: (e) => navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`),
	});
}

export default Map;