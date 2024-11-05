import {DataSource} from 'typeorm';

export const initializeIndices = (dataSource: DataSource) => {
  dataSource.query(
    `CREATE INDEX idx_gin_content ON offer USING gin (to_tsvector('russian', "title" || ' ' || "description"));`,
  );
  dataSource.query(
    `CREATE INDEX idx_gin_category_name ON category USING gin (to_tsvector('russian', "name"));`,
  );
};
