-- identifiers
INSERT INTO mappings (id, type, entity_field, input_field, is_required, compute, ai_summary) VALUES
('product.id',          'product', 'id',          'item_id',        TRUE,  NULL, 'Catalog item ID, used as the product primary key')
ON CONFLICT (id) DO NOTHING;

INSERT INTO mappings (id, type, entity_field, input_field, is_required, compute, ai_summary) VALUES
('product.item_number', 'product', 'item_number', 'hh_item_number', FALSE, NULL, 'Store item number, e.g. 1010-004')
ON CONFLICT (id) DO NOTHING;

-- name and description
INSERT INTO mappings (id, type, entity_field, input_field, is_required, compute, ai_summary) VALUES
('product.name_lang.en-US', 'product', 'name_lang.en-US', 'product_name', TRUE, NULL, 'Product name in English')
ON CONFLICT (id) DO NOTHING;

INSERT INTO mappings (id, type, entity_field, input_field, is_required, compute, ai_summary) VALUES
('product.description_lang.en-US', 'product', 'description_lang.en-US', NULL, FALSE,
  ARRAY['[data.extended_description_en, data.marketing_description_en].filter(Boolean).join("\n\n") || null'],
  'English feature bullets followed by the English marketing description')
ON CONFLICT (id) DO NOTHING;

INSERT INTO mappings (id, type, entity_field, input_field, is_required, compute, ai_summary) VALUES
('product.description_lang.fr-CA', 'product', 'description_lang.fr-CA', NULL, FALSE,
  ARRAY['[data.extended_description_fr, data.marketing_description_fr].filter(Boolean).join("\n\n") || null'],
  'French feature bullets followed by the French marketing description')
ON CONFLICT (id) DO NOTHING;

-- hierarchy
INSERT INTO mappings (id, type, entity_field, input_field, is_required, compute, ai_summary) VALUES
('product.department_code',            'product', 'department_code',            'department_code',    FALSE, NULL, 'Department code, e.g. 119')
ON CONFLICT (id) DO NOTHING;

INSERT INTO mappings (id, type, entity_field, input_field, is_required, compute, ai_summary) VALUES
('product.department_name_lang.en-US', 'product', 'department_name_lang.en-US', 'department_name',    FALSE, NULL, 'Department name in English, e.g. TOOLS, HAND')
ON CONFLICT (id) DO NOTHING;

INSERT INTO mappings (id, type, entity_field, input_field, is_required, compute, ai_summary) VALUES
('product.category_code',              'product', 'category_code',              'category_code',      FALSE, NULL, 'Category code, e.g. 246')
ON CONFLICT (id) DO NOTHING;

INSERT INTO mappings (id, type, entity_field, input_field, is_required, compute, ai_summary) VALUES
('product.type',                       'product', 'type',                       'product_class_name', FALSE, NULL, 'Product class name used as the product type, e.g. TOOL BELTS&ACC')
ON CONFLICT (id) DO NOTHING;

-- variant: text people read (by language)
INSERT INTO mappings (id, type, entity_field, input_field, is_required, compute, ai_summary) VALUES
('product.variant.material.en-US',      'product', 'variant.material.en-US',      'material',      FALSE, NULL, 'Material in English')
ON CONFLICT (id) DO NOTHING;

INSERT INTO mappings (id, type, entity_field, input_field, is_required, compute, ai_summary) VALUES
('product.variant.colour_family.en-US', 'product', 'variant.colour_family.en-US', 'colour_family', FALSE, NULL, 'Colour family in English')
ON CONFLICT (id) DO NOTHING;

INSERT INTO mappings (id, type, entity_field, input_field, is_required, compute, ai_summary) VALUES
('product.variant.colour_name.en-US',   'product', 'variant.colour_name.en-US',   'colour_name',   FALSE, NULL, 'Colour name in English')
ON CONFLICT (id) DO NOTHING;

-- variant: sizes and plain values
INSERT INTO mappings (id, type, entity_field, input_field, is_required, compute, ai_summary) VALUES
('product.variant.nominal_size',      'product', 'variant.nominal_size',      'nominal_size',      FALSE, NULL, 'Nominal size, e.g. 2x4')
ON CONFLICT (id) DO NOTHING;

INSERT INTO mappings (id, type, entity_field, input_field, is_required, compute, ai_summary) VALUES
('product.variant.actual_dimensions', 'product', 'variant.actual_dimensions', 'actual_dimensions', FALSE, NULL, 'Actual dimensions as text')
ON CONFLICT (id) DO NOTHING;

INSERT INTO mappings (id, type, entity_field, input_field, is_required, compute, ai_summary) VALUES
('product.variant.moisture',          'product', 'variant.moisture',          'moisture',          FALSE, NULL, 'Moisture grade, e.g. KD')
ON CONFLICT (id) DO NOTHING;

-- variant: numbers and flags (converted from CSV text)
INSERT INTO mappings (id, type, entity_field, input_field, is_required, compute, ai_summary) VALUES
('product.variant.height',     'product', 'variant.height',     'height',     FALSE, ARRAY['data.height ? Number(data.height) : null'],         'Height as a number')
ON CONFLICT (id) DO NOTHING;

INSERT INTO mappings (id, type, entity_field, input_field, is_required, compute, ai_summary) VALUES
('product.variant.length',     'product', 'variant.length',     'length',     FALSE, ARRAY['data.length ? Number(data.length) : null'],         'Length as a number')
ON CONFLICT (id) DO NOTHING;

INSERT INTO mappings (id, type, entity_field, input_field, is_required, compute, ai_summary) VALUES
('product.variant.width',      'product', 'variant.width',      'width',      FALSE, ARRAY['data.width ? Number(data.width) : null'],           'Width as a number')
ON CONFLICT (id) DO NOTHING;

INSERT INTO mappings (id, type, entity_field, input_field, is_required, compute, ai_summary) VALUES
('product.variant.board_feet', 'product', 'variant.board_feet', 'board_feet', FALSE, ARRAY['data.board_feet ? Number(data.board_feet) : null'], 'Board feet as a number')
ON CONFLICT (id) DO NOTHING;

INSERT INTO mappings (id, type, entity_field, input_field, is_required, compute, ai_summary) VALUES
('product.variant.treated',    'product', 'variant.treated',    'treated',    FALSE,
  ARRAY['data.treated ? ["Y","YES","TRUE","1"].includes(String(data.treated).trim().toUpperCase()) : null'],
  'Whether the lumber is treated, as true or false')
ON CONFLICT (id) DO NOTHING;
