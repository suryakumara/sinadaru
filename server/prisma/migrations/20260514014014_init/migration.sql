-- CreateTable
CREATE TABLE `pasars` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NULL,
    `deskripsi` TEXT NULL,
    `denah_url` VARCHAR(500) NULL,
    `scale_x` DOUBLE NOT NULL DEFAULT 0.05,
    `scale_y` DOUBLE NOT NULL DEFAULT 0.05,
    `origin_x` DOUBLE NOT NULL DEFAULT 100,
    `origin_y` DOUBLE NOT NULL DEFAULT 500,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kios` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `pemilik` VARCHAR(191) NULL,
    `kategori` ENUM('SAYUR', 'DAGING', 'IKAN', 'BUMBU', 'LAINNYA') NOT NULL DEFAULT 'LAINNYA',
    `blok` VARCHAR(191) NOT NULL,
    `nomor_kios` VARCHAR(191) NOT NULL,
    `posisi_x` DOUBLE NULL,
    `posisi_y` DOUBLE NULL,
    `deskripsi` TEXT NULL,
    `pasar_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `kios` ADD CONSTRAINT `kios_pasar_id_fkey` FOREIGN KEY (`pasar_id`) REFERENCES `pasars`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
