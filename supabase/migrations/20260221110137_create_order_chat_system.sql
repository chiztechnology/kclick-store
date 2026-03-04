/*
  # Order Chat System

  ## Overview
  Creates a real-time chat system for order-related communication between:
  - Customers and store providers (per order)
  - Admins, customers, and stores (in dispute/litige context)

  ## New Tables

  ### order_chats
  - One chat thread per order
  - Tracks if chat is open/closed (litige resolved closes it)
  - Tracks if litige is open (enables admin participation)

  ### order_messages
  - Individual messages in a chat
  - Supports text and image content types
  - Tracks sender role (customer, store, admin)
  - Soft delete: messages deletable by owner

  ## Security
  - RLS enabled on both tables
  - Customers can only see chats for their own orders
  - Store managers can see chats for orders in their store
  - Admins can see all chats
  - Only authenticated users can insert/delete their own messages
*/

CREATE TABLE IF NOT EXISTS order_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  is_open boolean NOT NULL DEFAULT true,
  is_litige boolean NOT NULL DEFAULT false,
  litige_resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(order_id)
);

CREATE TABLE IF NOT EXISTS order_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES order_chats(id) ON DELETE CASCADE,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role text NOT NULL CHECK (sender_role IN ('customer', 'store', 'admin')),
  sender_name text NOT NULL DEFAULT '',
  content text,
  image_url text,
  content_type text NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'image')),
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their order chats"
  ON order_chats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_chats.order_id
      AND orders.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM orders
      JOIN stores ON stores.id = orders.store_id
      WHERE orders.id = order_chats.order_id
      AND stores.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can insert order chats for their orders"
  ON order_chats FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_chats.order_id
      AND orders.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update order chats"
  ON order_chats FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view messages in their order chats"
  ON order_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_messages.order_id
      AND orders.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM orders
      JOIN stores ON stores.id = orders.store_id
      WHERE orders.id = order_messages.order_id
      AND stores.owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can send messages to accessible chats"
  ON order_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND
    EXISTS (
      SELECT 1 FROM order_chats
      WHERE order_chats.id = order_messages.chat_id
      AND order_chats.is_open = true
      AND (
        order_chats.litige_resolved = false
        OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Users can soft-delete their own messages"
  ON order_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

CREATE INDEX IF NOT EXISTS idx_order_messages_chat_id ON order_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_order_messages_order_id ON order_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_order_chats_order_id ON order_chats(order_id);

CREATE OR REPLACE FUNCTION update_order_chat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE order_chats SET updated_at = now() WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_order_message_insert
  AFTER INSERT ON order_messages
  FOR EACH ROW EXECUTE FUNCTION update_order_chat_updated_at();
