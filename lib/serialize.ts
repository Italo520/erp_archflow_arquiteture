// Helper to serialize Prisma Decimal to Number to prevent Next.js Client Component errors
export function serializeData(data: any): any {
    if (data === null || data === undefined) return data;
    if (typeof data !== 'object') return data;
    if (data instanceof Date) return data;
    
    if (data.constructor?.name === 'Decimal' || typeof data.toNumber === 'function') {
        return Number(data.toString());
    }

    if (Array.isArray(data)) {
        return data.map(serializeData);
    }

    const serialized: any = {};
    for (const key in data) {
        serialized[key] = serializeData(data[key]);
    }
    
    // Retrocompatibilidade para Project: status = currentColumnId
    if (data && typeof data === 'object' && 'currentColumnId' in data && data.currentColumnId !== undefined) {
        serialized.status = data.currentColumnId;
    }
    
    return serialized;
}
