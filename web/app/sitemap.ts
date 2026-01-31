import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://mongoose-studio.yaasir.dev',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: 'https://mongoose-studio.yaasir.dev/docs',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
    ]
}
