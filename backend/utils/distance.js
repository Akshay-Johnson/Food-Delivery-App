export function getDistanceInKm(lat1, lon1, lat2, lon2) {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null ||
      lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return 0;
  }
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2)); // return rounded distance in km
}

export function calculateDeliveryCharge(distanceInKm) {
  const baseCharge = 30; // base delivery charge ₹30
  const freeKm = 3;      // free base distance 3km
  const perKmRate = 10;  // ₹10 per extra km

  if (distanceInKm <= freeKm) {
    return baseCharge;
  }
  return baseCharge + Math.round((distanceInKm - freeKm) * perKmRate);
}
