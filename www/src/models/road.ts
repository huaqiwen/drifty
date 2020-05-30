import { Vector3 } from 'babylonjs';

export class Road {
    /// The lengths of straight segments of the road, generated by calling `generateSegments`
    segments: number[];

    constructor(
        public length: number,
        public roadCurveProbability: (straightLength: number) => number,
    ) {
        this.segments = this.generateSegments();
    }

    /**
     * Generate the straight segments of the road.
     */
    generateSegments(): number[] {
        const segments = [];

        let currentLength = 1;
        let currentSegmentLength = 1;

        while (currentLength < this.length) {
            const prob = this.roadCurveProbability(currentSegmentLength);

            if (Math.random() < prob) {
                // Road should curve
                segments.push(currentSegmentLength);
                currentSegmentLength = 1;
            } else {
                // Go straight
                currentSegmentLength++;
            }
            currentLength++;
        }

        return segments;
    }

    /**
     * Return true if the road contains the vector, otherwise false.
     */
    contains(vec: Vector3, roadWidth: number): boolean {
        let currentX = 0;
        let currentZ = 0;
        let directionIsRight = false;

        for (let segment of this.segments) {
            let zLength = roadWidth;
            let xLength = roadWidth;

            if (directionIsRight) {
                xLength = roadWidth * segment;
            } else {
                zLength = roadWidth * segment;
            }

            let minX = currentX * roadWidth;
            let maxX = minX + xLength;
            let minZ = currentZ * roadWidth;
            let maxZ = minZ + zLength;

            if (vec.x < minX || vec.z < minZ) {
                return false;
            } else if (vec.x <= maxX && vec.z <= maxZ) {
                return true;
            }

            if (directionIsRight) {
                currentX += segment;
            } else {
                currentZ += segment;
            }
            directionIsRight = !directionIsRight;
        }

        return false;
    }
}