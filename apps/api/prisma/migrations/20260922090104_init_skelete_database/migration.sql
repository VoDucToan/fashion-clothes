-- CreateTable
CREATE TABLE "site_user" (
    "id" UUID NOT NULL,
    "email_address" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "site_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "country" (
    "id" UUID NOT NULL,
    "country_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address" (
    "id" UUID NOT NULL,
    "unit_number" TEXT,
    "street_number" TEXT,
    "address_line1" TEXT NOT NULL,
    "address_line2" TEXT,
    "city" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "country_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_address" (
    "user_id" UUID NOT NULL,
    "address_id" UUID NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "user_address_pkey" PRIMARY KEY ("user_id","address_id")
);

-- CreateTable
CREATE TABLE "payment_type" (
    "id" UUID NOT NULL,
    "value" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "payment_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_payment_method" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "payment_type_id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "expiry_date" DATE NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "user_payment_method_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_category" (
    "id" UUID NOT NULL,
    "parent_category_id" UUID,
    "category_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "product_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "product_image" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_item" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "sku" TEXT NOT NULL,
    "qty_in_stock" INTEGER NOT NULL,
    "product_image" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "product_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variation" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "variation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variation_option" (
    "id" UUID NOT NULL,
    "variation_id" UUID NOT NULL,
    "value" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "variation_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_configuration" (
    "product_item_id" UUID NOT NULL,
    "variation_option_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "product_configuration_pkey" PRIMARY KEY ("product_item_id","variation_option_id")
);

-- CreateTable
CREATE TABLE "promotion" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discount_rate" DECIMAL(5,2) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_category" (
    "category_id" UUID NOT NULL,
    "promotion_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "promotion_category_pkey" PRIMARY KEY ("category_id","promotion_id")
);

-- CreateTable
CREATE TABLE "shopping_cart" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "shopping_cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopping_cart_item" (
    "id" UUID NOT NULL,
    "cart_id" UUID NOT NULL,
    "product_item_id" UUID NOT NULL,
    "qty" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "shopping_cart_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_method" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "shipping_method_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status" (
    "id" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "order_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_order" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "order_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_method_id" UUID NOT NULL,
    "shipping_address" UUID NOT NULL,
    "shipping_method" UUID NOT NULL,
    "order_total" DECIMAL(10,2) NOT NULL,
    "order_status" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "shop_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_line" (
    "id" UUID NOT NULL,
    "product_item_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "qty" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "order_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_review" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "ordered_product_id" UUID NOT NULL,
    "rating_value" INTEGER NOT NULL,
    "comment" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" UUID,

    CONSTRAINT "user_review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "site_user_email_address_key" ON "site_user"("email_address");

-- CreateIndex
CREATE INDEX "address_country_id_idx" ON "address"("country_id");

-- CreateIndex
CREATE INDEX "user_address_address_id_idx" ON "user_address"("address_id");

-- CreateIndex
CREATE INDEX "user_payment_method_user_id_idx" ON "user_payment_method"("user_id");

-- CreateIndex
CREATE INDEX "user_payment_method_payment_type_id_idx" ON "user_payment_method"("payment_type_id");

-- CreateIndex
CREATE INDEX "product_category_parent_category_id_idx" ON "product_category"("parent_category_id");

-- CreateIndex
CREATE INDEX "product_category_id_idx" ON "product"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_item_sku_key" ON "product_item"("sku");

-- CreateIndex
CREATE INDEX "product_item_product_id_idx" ON "product_item"("product_id");

-- CreateIndex
CREATE INDEX "variation_category_id_idx" ON "variation"("category_id");

-- CreateIndex
CREATE INDEX "variation_option_variation_id_idx" ON "variation_option"("variation_id");

-- CreateIndex
CREATE INDEX "product_configuration_variation_option_id_idx" ON "product_configuration"("variation_option_id");

-- CreateIndex
CREATE INDEX "promotion_category_promotion_id_idx" ON "promotion_category"("promotion_id");

-- CreateIndex
CREATE INDEX "shopping_cart_user_id_idx" ON "shopping_cart"("user_id");

-- CreateIndex
CREATE INDEX "shopping_cart_item_product_item_id_idx" ON "shopping_cart_item"("product_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "shopping_cart_item_cart_id_product_item_id_key" ON "shopping_cart_item"("cart_id", "product_item_id");

-- CreateIndex
CREATE INDEX "shop_order_user_id_idx" ON "shop_order"("user_id");

-- CreateIndex
CREATE INDEX "shop_order_order_status_idx" ON "shop_order"("order_status");

-- CreateIndex
CREATE INDEX "shop_order_payment_method_id_idx" ON "shop_order"("payment_method_id");

-- CreateIndex
CREATE INDEX "shop_order_shipping_address_idx" ON "shop_order"("shipping_address");

-- CreateIndex
CREATE INDEX "shop_order_shipping_method_idx" ON "shop_order"("shipping_method");

-- CreateIndex
CREATE INDEX "order_line_order_id_idx" ON "order_line"("order_id");

-- CreateIndex
CREATE INDEX "order_line_product_item_id_idx" ON "order_line"("product_item_id");

-- CreateIndex
CREATE INDEX "user_review_user_id_idx" ON "user_review"("user_id");

-- CreateIndex
CREATE INDEX "user_review_ordered_product_id_idx" ON "user_review"("ordered_product_id");

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_address" ADD CONSTRAINT "user_address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "site_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_address" ADD CONSTRAINT "user_address_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_payment_method" ADD CONSTRAINT "user_payment_method_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "site_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_payment_method" ADD CONSTRAINT "user_payment_method_payment_type_id_fkey" FOREIGN KEY ("payment_type_id") REFERENCES "payment_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_category" ADD CONSTRAINT "product_category_parent_category_id_fkey" FOREIGN KEY ("parent_category_id") REFERENCES "product_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_item" ADD CONSTRAINT "product_item_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variation" ADD CONSTRAINT "variation_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variation_option" ADD CONSTRAINT "variation_option_variation_id_fkey" FOREIGN KEY ("variation_id") REFERENCES "variation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_configuration" ADD CONSTRAINT "product_configuration_product_item_id_fkey" FOREIGN KEY ("product_item_id") REFERENCES "product_item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_configuration" ADD CONSTRAINT "product_configuration_variation_option_id_fkey" FOREIGN KEY ("variation_option_id") REFERENCES "variation_option"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_category" ADD CONSTRAINT "promotion_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_category" ADD CONSTRAINT "promotion_category_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_cart" ADD CONSTRAINT "shopping_cart_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "site_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_cart_item" ADD CONSTRAINT "shopping_cart_item_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "shopping_cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_cart_item" ADD CONSTRAINT "shopping_cart_item_product_item_id_fkey" FOREIGN KEY ("product_item_id") REFERENCES "product_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_order" ADD CONSTRAINT "shop_order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "site_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_order" ADD CONSTRAINT "shop_order_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "user_payment_method"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_order" ADD CONSTRAINT "shop_order_shipping_address_fkey" FOREIGN KEY ("shipping_address") REFERENCES "address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_order" ADD CONSTRAINT "shop_order_shipping_method_fkey" FOREIGN KEY ("shipping_method") REFERENCES "shipping_method"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_order" ADD CONSTRAINT "shop_order_order_status_fkey" FOREIGN KEY ("order_status") REFERENCES "order_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_line" ADD CONSTRAINT "order_line_product_item_id_fkey" FOREIGN KEY ("product_item_id") REFERENCES "product_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_line" ADD CONSTRAINT "order_line_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "shop_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_review" ADD CONSTRAINT "user_review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "site_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_review" ADD CONSTRAINT "user_review_ordered_product_id_fkey" FOREIGN KEY ("ordered_product_id") REFERENCES "order_line"("id") ON DELETE CASCADE ON UPDATE CASCADE;
