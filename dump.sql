--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: brand_status_enum; Type: TYPE; Schema: public; Owner: clickone
--

CREATE TYPE public.brand_status_enum AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE public.brand_status_enum OWNER TO clickone;

--
-- Name: collections_status_enum; Type: TYPE; Schema: public; Owner: clickone
--

CREATE TYPE public.collections_status_enum AS ENUM (
    'active',
    'inactive',
    'scheduled'
);


ALTER TYPE public.collections_status_enum OWNER TO clickone;

--
-- Name: collections_type_enum; Type: TYPE; Schema: public; Owner: clickone
--

CREATE TYPE public.collections_type_enum AS ENUM (
    'manual',
    'automatic',
    'seasonal'
);


ALTER TYPE public.collections_type_enum OWNER TO clickone;

--
-- Name: products_status_enum; Type: TYPE; Schema: public; Owner: clickone
--

CREATE TYPE public.products_status_enum AS ENUM (
    'active',
    'draft',
    'archived'
);


ALTER TYPE public.products_status_enum OWNER TO clickone;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attribute_values; Type: TABLE; Schema: public; Owner: clickone
--

CREATE TABLE public.attribute_values (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    value character varying(255) NOT NULL,
    hex_code character varying(255) NOT NULL
);


ALTER TABLE public.attribute_values OWNER TO clickone;

--
-- Name: attribute_values_id_seq; Type: SEQUENCE; Schema: public; Owner: clickone
--

CREATE SEQUENCE public.attribute_values_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attribute_values_id_seq OWNER TO clickone;

--
-- Name: attribute_values_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: clickone
--

ALTER SEQUENCE public.attribute_values_id_seq OWNED BY public.attribute_values.id;


--
-- Name: brand; Type: TABLE; Schema: public; Owner: clickone
--

CREATE TABLE public.brand (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    country character varying(255),
    logo character varying(255),
    website character varying(255),
    status public.brand_status_enum DEFAULT 'active'::public.brand_status_enum NOT NULL,
    "productsCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.brand OWNER TO clickone;

--
-- Name: brand_id_seq; Type: SEQUENCE; Schema: public; Owner: clickone
--

CREATE SEQUENCE public.brand_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.brand_id_seq OWNER TO clickone;

--
-- Name: brand_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: clickone
--

ALTER SEQUENCE public.brand_id_seq OWNED BY public.brand.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: clickone
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying NOT NULL,
    slug character varying NOT NULL,
    description character varying,
    image character varying,
    "parentId" integer,
    "isActive" boolean,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.categories OWNER TO clickone;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: clickone
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO clickone;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: clickone
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: collection_products; Type: TABLE; Schema: public; Owner: clickone
--

CREATE TABLE public.collection_products (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "collectionId" uuid NOT NULL,
    "productId" integer NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    collection_id uuid,
    product_id integer
);


ALTER TABLE public.collection_products OWNER TO clickone;

--
-- Name: collections; Type: TABLE; Schema: public; Owner: clickone
--

CREATE TABLE public.collections (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    type public.collections_type_enum DEFAULT 'manual'::public.collections_type_enum NOT NULL,
    status public.collections_status_enum DEFAULT 'active'::public.collections_status_enum NOT NULL,
    "productsCount" integer DEFAULT 0 NOT NULL,
    "startDate" timestamp without time zone,
    "endDate" timestamp without time zone,
    conditions jsonb,
    image character varying(500),
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.collections OWNER TO clickone;

--
-- Name: product_families; Type: TABLE; Schema: public; Owner: clickone
--

CREATE TABLE public.product_families (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.product_families OWNER TO clickone;

--
-- Name: product_families_id_seq; Type: SEQUENCE; Schema: public; Owner: clickone
--

CREATE SEQUENCE public.product_families_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_families_id_seq OWNER TO clickone;

--
-- Name: product_families_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: clickone
--

ALTER SEQUENCE public.product_families_id_seq OWNED BY public.product_families.id;


--
-- Name: product_option_values; Type: TABLE; Schema: public; Owner: clickone
--

CREATE TABLE public.product_option_values (
    id integer NOT NULL,
    "valueId" integer NOT NULL,
    product_id integer,
    value_id integer
);


ALTER TABLE public.product_option_values OWNER TO clickone;

--
-- Name: product_option_values_id_seq; Type: SEQUENCE; Schema: public; Owner: clickone
--

CREATE SEQUENCE public.product_option_values_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_option_values_id_seq OWNER TO clickone;

--
-- Name: product_option_values_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: clickone
--

ALTER SEQUENCE public.product_option_values_id_seq OWNED BY public.product_option_values.id;


--
-- Name: product_settings; Type: TABLE; Schema: public; Owner: clickone
--

CREATE TABLE public.product_settings (
    id integer NOT NULL,
    key character varying(255) NOT NULL,
    value character varying(255) NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    product_id integer
);


ALTER TABLE public.product_settings OWNER TO clickone;

--
-- Name: product_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: clickone
--

CREATE SEQUENCE public.product_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_settings_id_seq OWNER TO clickone;

--
-- Name: product_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: clickone
--

ALTER SEQUENCE public.product_settings_id_seq OWNED BY public.product_settings.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: clickone
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    price numeric(10,2) NOT NULL,
    stock boolean DEFAULT true NOT NULL,
    description text NOT NULL,
    sku character varying(255) NOT NULL,
    image text,
    status public.products_status_enum DEFAULT 'draft'::public.products_status_enum NOT NULL,
    "familyId" integer,
    attributes jsonb,
    "comparePrice" numeric(10,2),
    translations jsonb,
    "seoTitle" character varying(255),
    "seoDescription" text,
    weight numeric(10,2),
    dimensions jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    category_id integer,
    brand_id integer
);


ALTER TABLE public.products OWNER TO clickone;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: clickone
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO clickone;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: clickone
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: attribute_values id; Type: DEFAULT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.attribute_values ALTER COLUMN id SET DEFAULT nextval('public.attribute_values_id_seq'::regclass);


--
-- Name: brand id; Type: DEFAULT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.brand ALTER COLUMN id SET DEFAULT nextval('public.brand_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: product_families id; Type: DEFAULT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.product_families ALTER COLUMN id SET DEFAULT nextval('public.product_families_id_seq'::regclass);


--
-- Name: product_option_values id; Type: DEFAULT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.product_option_values ALTER COLUMN id SET DEFAULT nextval('public.product_option_values_id_seq'::regclass);


--
-- Name: product_settings id; Type: DEFAULT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.product_settings ALTER COLUMN id SET DEFAULT nextval('public.product_settings_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Data for Name: attribute_values; Type: TABLE DATA; Schema: public; Owner: clickone
--

COPY public.attribute_values (id, name, slug, value, hex_code) FROM stdin;
\.


--
-- Data for Name: brand; Type: TABLE DATA; Schema: public; Owner: clickone
--

COPY public.brand (id, name, slug, description, country, logo, website, status, "productsCount", "createdAt", "updatedAt") FROM stdin;
2	цуацуа	цуацуа		цуацуа	\N	https://local.com	active	0	2025-07-11 12:59:36.154452	2025-07-11 12:59:36.154452
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: clickone
--

COPY public.categories (id, name, slug, description, image, "parentId", "isActive", "sortOrder", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: collection_products; Type: TABLE DATA; Schema: public; Owner: clickone
--

COPY public.collection_products (id, "collectionId", "productId", "sortOrder", "createdAt", collection_id, product_id) FROM stdin;
\.


--
-- Data for Name: collections; Type: TABLE DATA; Schema: public; Owner: clickone
--

COPY public.collections (id, name, slug, description, type, status, "productsCount", "startDate", "endDate", conditions, image, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: product_families; Type: TABLE DATA; Schema: public; Owner: clickone
--

COPY public.product_families (id, name, description, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: product_option_values; Type: TABLE DATA; Schema: public; Owner: clickone
--

COPY public.product_option_values (id, "valueId", product_id, value_id) FROM stdin;
\.


--
-- Data for Name: product_settings; Type: TABLE DATA; Schema: public; Owner: clickone
--

COPY public.product_settings (id, key, value, "createdAt", "updatedAt", product_id) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: clickone
--

COPY public.products (id, name, price, stock, description, sku, image, status, "familyId", attributes, "comparePrice", translations, "seoTitle", "seoDescription", weight, dimensions, "createdAt", "updatedAt", category_id, brand_id) FROM stdin;
\.


--
-- Name: attribute_values_id_seq; Type: SEQUENCE SET; Schema: public; Owner: clickone
--

SELECT pg_catalog.setval('public.attribute_values_id_seq', 1, false);


--
-- Name: brand_id_seq; Type: SEQUENCE SET; Schema: public; Owner: clickone
--

SELECT pg_catalog.setval('public.brand_id_seq', 2, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: clickone
--

SELECT pg_catalog.setval('public.categories_id_seq', 1, true);


--
-- Name: product_families_id_seq; Type: SEQUENCE SET; Schema: public; Owner: clickone
--

SELECT pg_catalog.setval('public.product_families_id_seq', 1, false);


--
-- Name: product_option_values_id_seq; Type: SEQUENCE SET; Schema: public; Owner: clickone
--

SELECT pg_catalog.setval('public.product_option_values_id_seq', 1, false);


--
-- Name: product_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: clickone
--

SELECT pg_catalog.setval('public.product_settings_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: clickone
--

SELECT pg_catalog.setval('public.products_id_seq', 1, false);


--
-- Name: products PK_0806c755e0aca124e67c0cf6d7d; Type: CONSTRAINT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY (id);


--
-- Name: collections PK_21c00b1ebbd41ba1354242c5c4e; Type: CONSTRAINT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT "PK_21c00b1ebbd41ba1354242c5c4e" PRIMARY KEY (id);


--
-- Name: categories PK_24dbc6126a28ff948da33e97d3b; Type: CONSTRAINT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY (id);


--
-- Name: attribute_values PK_3babf93d1842d73e7ba849c0160; Type: CONSTRAINT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.attribute_values
    ADD CONSTRAINT "PK_3babf93d1842d73e7ba849c0160" PRIMARY KEY (id);


--
-- Name: collection_products PK_5332f8b4cbc00fba1b092b15837; Type: CONSTRAINT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.collection_products
    ADD CONSTRAINT "PK_5332f8b4cbc00fba1b092b15837" PRIMARY KEY (id);


--
-- Name: product_families PK_75f2c625b29b72a3fa025af057b; Type: CONSTRAINT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.product_families
    ADD CONSTRAINT "PK_75f2c625b29b72a3fa025af057b" PRIMARY KEY (id);


--
-- Name: product_settings PK_8a366b7c7a94f8691b9e40b3bb5; Type: CONSTRAINT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.product_settings
    ADD CONSTRAINT "PK_8a366b7c7a94f8691b9e40b3bb5" PRIMARY KEY (id);


--
-- Name: brand PK_a5d20765ddd942eb5de4eee2d7f; Type: CONSTRAINT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.brand
    ADD CONSTRAINT "PK_a5d20765ddd942eb5de4eee2d7f" PRIMARY KEY (id);


--
-- Name: product_option_values PK_c5ddd425048b2df1a76cb9d5226; Type: CONSTRAINT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.product_option_values
    ADD CONSTRAINT "PK_c5ddd425048b2df1a76cb9d5226" PRIMARY KEY (id);


--
-- Name: categories UQ_420d9f679d41281f282f5bc7d09; Type: CONSTRAINT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE (slug);


--
-- Name: brand UQ_5f468ae5696f07da025138e38f7; Type: CONSTRAINT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.brand
    ADD CONSTRAINT "UQ_5f468ae5696f07da025138e38f7" UNIQUE (name);


--
-- Name: collections UQ_99d0d14f9f23b45d2c6648c4b57; Type: CONSTRAINT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT "UQ_99d0d14f9f23b45d2c6648c4b57" UNIQUE (slug);


--
-- Name: brand UQ_f4436285f5d5785c7fb0b28b309; Type: CONSTRAINT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.brand
    ADD CONSTRAINT "UQ_f4436285f5d5785c7fb0b28b309" UNIQUE (slug);


--
-- Name: products FK_1530a6f15d3c79d1b70be98f2be; Type: FK CONSTRAINT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "FK_1530a6f15d3c79d1b70be98f2be" FOREIGN KEY (brand_id) REFERENCES public.brand(id);


--
-- Name: products FK_456fa32e57822edf6d7631ff50d; Type: FK CONSTRAINT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "FK_456fa32e57822edf6d7631ff50d" FOREIGN KEY ("familyId") REFERENCES public.product_families(id);


--
-- Name: product_option_values FK_56909fb67ce2d05679d97b94a8a; Type: FK CONSTRAINT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.product_option_values
    ADD CONSTRAINT "FK_56909fb67ce2d05679d97b94a8a" FOREIGN KEY (value_id) REFERENCES public.attribute_values(id);


--
-- Name: product_option_values FK_6c69371ae136e95a88a55249cef; Type: FK CONSTRAINT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.product_option_values
    ADD CONSTRAINT "FK_6c69371ae136e95a88a55249cef" FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: collection_products FK_862459bc848778744e0370048de; Type: FK CONSTRAINT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.collection_products
    ADD CONSTRAINT "FK_862459bc848778744e0370048de" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products FK_9a5f6868c96e0069e699f33e124; Type: FK CONSTRAINT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: product_settings FK_e551a65799fbf576c41146389a7; Type: FK CONSTRAINT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.product_settings
    ADD CONSTRAINT "FK_e551a65799fbf576c41146389a7" FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: collection_products FK_e87d3f6a1fa89a197975d3fc527; Type: FK CONSTRAINT; Schema: public; Owner: clickone
--

ALTER TABLE ONLY public.collection_products
    ADD CONSTRAINT "FK_e87d3f6a1fa89a197975d3fc527" FOREIGN KEY (collection_id) REFERENCES public.collections(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

