import { prisma } from '@/lib/prisma';

/**
 * Updates tag usage counts when tags are used in games or templates
 * @param tags Array of tag names to increment usage for
 */
export async function updateTagUsage(tags: string[]): Promise<void> {
    if (!tags || tags.length === 0) {
        return;
    }

    // Process each tag - normalize to lowercase for consistency
    const normalizedTags = tags.map(tag => tag.toLowerCase().trim()).filter(Boolean);

    for (const tagName of normalizedTags) {
        try {
            // Use upsert to either update existing tag or create new one
            await prisma.tag.upsert({
                where: {
                    name: tagName
                },
                update: {
                    usageCount: {
                        increment: 1
                    }
                },
                create: {
                    name: tagName,
                    usageCount: 1
                }
            });
        } catch (error) {
            console.error(`Failed to update tag usage for "${tagName}":`, error);
            // Continue processing other tags even if one fails
        }
    }
}

/**
 * Decrements tag usage counts when content is made private/unshared
 * @param tags Array of tag names to decrement usage for
 */
export async function decrementTagUsage(tags: string[]): Promise<void> {
    if (!tags || tags.length === 0) {
        return;
    }

    // Process each tag - normalize to lowercase for consistency
    const normalizedTags = tags.map(tag => tag.toLowerCase().trim()).filter(Boolean);

    for (const tagName of normalizedTags) {
        try {
            // Find the existing tag
            const existingTag = await prisma.tag.findUnique({
                where: { name: tagName }
            });

            if (existingTag) {
                if (existingTag.usageCount <= 1) {
                    // If usage count is 1 or less, delete the tag entirely
                    await prisma.tag.delete({
                        where: { name: tagName }
                    });
                } else {
                    // Otherwise, just decrement the count
                    await prisma.tag.update({
                        where: { name: tagName },
                        data: {
                            usageCount: {
                                decrement: 1
                            }
                        }
                    });
                }
            }
        } catch (error) {
            console.error(`Failed to decrement tag usage for "${tagName}":`, error);
            // Continue processing other tags even if one fails
        }
    }
}

/**
 * Efficiently updates tag usage by comparing old and new tag arrays
 * Only increments newly added tags and decrements removed tags
 * @param previousTags Array of previously used tag names
 * @param newTags Array of new tag names
 */
export async function updateTagUsageFromChanges(previousTags: string[], newTags: string[]): Promise<void> {
    // Normalize both arrays
    const normalizedPrevious = (previousTags || []).map(tag => tag.toLowerCase().trim()).filter(Boolean);
    const normalizedNew = (newTags || []).map(tag => tag.toLowerCase().trim()).filter(Boolean);
    
    // Find tags that were added (in new but not in previous)
    const addedTags = normalizedNew.filter(tag => !normalizedPrevious.includes(tag));
    
    // Find tags that were removed (in previous but not in new)
    const removedTags = normalizedPrevious.filter(tag => !normalizedNew.includes(tag));
    
    // Increment usage for added tags
    if (addedTags.length > 0) {
        try {
            await updateTagUsage(addedTags);
            console.log('[Tag Usage] Added tags:', addedTags);
        } catch (error) {
            console.error('[Tag Usage] Error adding tags:', error);
        }
    }
    
    // Decrement usage for removed tags
    if (removedTags.length > 0) {
        try {
            await decrementTagUsage(removedTags);
            console.log('[Tag Usage] Removed tags:', removedTags);
        } catch (error) {
            console.error('[Tag Usage] Error removing tags:', error);
        }
    }
}

/**
 * Gets all tags with their usage counts, sorted by usage count descending
 * @param limit Optional limit on number of tags to return
 * @returns Array of tags with usage counts
 */
export async function getTagsWithUsage(limit?: number): Promise<Array<{ name: string; usageCount: number }>> {
    try {
        const tags = await prisma.tag.findMany({
            select: {
                name: true,
                usageCount: true
            },
            orderBy: {
                usageCount: 'desc'
            },
            ...(limit && { take: limit })
        });

        return tags;
    } catch (error) {
        console.error('Failed to fetch tags with usage:', error);
        return [];
    }
}

/**
 * Gets usage count for a specific tag
 * @param tagName Name of the tag to get usage for
 * @returns Usage count or 0 if tag not found
 */
export async function getTagUsageCount(tagName: string): Promise<number> {
    try {
        const tag = await prisma.tag.findUnique({
            where: {
                name: tagName.toLowerCase().trim()
            },
            select: {
                usageCount: true
            }
        });

        return tag?.usageCount || 0;
    } catch (error) {
        console.error(`Failed to get usage count for tag "${tagName}":`, error);
        return 0;
    }
}