<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260219000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create joke table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
            CREATE TABLE joke (
                id SERIAL PRIMARY KEY,
                content TEXT NOT NULL,
                author VARCHAR(100) DEFAULT NULL,
                created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL
            )
        SQL);

        $this->addSql(<<<'SQL'
            COMMENT ON COLUMN joke.created_at IS '(DC2Type:datetime_immutable)'
        SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE joke');
    }
}
