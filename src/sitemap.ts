import {INestApplication} from '@nestjs/common';
import {DataSource, MoreThan} from 'typeorm';
import {Category} from './entities/Category';
import {Offer} from './entities/Offer';
import {writeFile} from 'fs/promises';
import {ConfigService} from '@nestjs/config';

type ChangeFreq =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

const createUrlTag = ({
  loc,
  changefreq,
  priority,
}: {
  loc: string;
  changefreq: ChangeFreq;
  priority: `${1 | 0}.${number}${number}`;
}) => {
  return `  <url>
    <loc>https://tridva.store/${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
};

const generateSiteMapContent = async (app: INestApplication<any>) => {
  const dataSource = app.get(DataSource);
  const categoryRepository = dataSource.getRepository(Category);
  const offerRepository = dataSource.getRepository(Offer);

  const categoriesIds = await categoryRepository.find({
    select: {id: true},
    where: {offersCount: MoreThan(1)},
  });

  const offersIds = await offerRepository.find({
    select: {id: true},
    order: {description: 'desc'},
    take: 40_000,
  });

  const categoriesUrls = categoriesIds.map(({id}) =>
    createUrlTag({
      loc: `categories/${id}`,
      changefreq: 'weekly',
      priority: '0.80',
    }),
  );

  const offersUrls = offersIds.map(({id}) =>
    createUrlTag({
      loc: `offer/${id}`,
      changefreq: 'weekly',
      priority: '0.60',
    }),
  );

  return `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tridva.store/</loc>
    <changefreq>daily</changefreq>
    <priority>1.00</priority>
  </url>
  <url>
    <loc>https://tridva.store/categories/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.90</priority>
  </url>
${categoriesUrls.join('\n')}
${offersUrls.join('\n')}
</urlset>`;
};

export const generateSiteMap = async (app: INestApplication<any>) => {
  const isDev = app.get(ConfigService).get('IS_DEV');

  if (isDev) return;

  const siteMapContent = await generateSiteMapContent(app);

  await writeFile(`/var/tmp/shared-docker/sitemap.xml`, siteMapContent, {
    flag: 'w+',
  });
  console.log(`Site map generated to /var/tmp/shared-docker/sitemap.xml`);
};
