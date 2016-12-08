--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.3
-- Dumped by pg_dump version 9.5.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE accounts (
    id uuid NOT NULL,
    facebook_id bigint NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: knex_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE knex_migrations (
    id integer NOT NULL,
    name character varying(255),
    batch integer,
    migration_time timestamp with time zone
);


--
-- Name: knex_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE knex_migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: knex_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE knex_migrations_id_seq OWNED BY knex_migrations.id;


--
-- Name: knex_migrations_lock; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE knex_migrations_lock (
    is_locked integer
);


--
-- Name: points; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE points (
    id uuid NOT NULL,
    lat numeric NOT NULL,
    lng numeric NOT NULL,
    alt numeric,
    floor_level integer,
    vertical_accuracy numeric,
    horizontal_accuracy numeric,
    account_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    CONSTRAINT points_created_at_check CHECK ((created_at > '2015-01-01 00:00:00-08'::timestamp with time zone))
);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY knex_migrations ALTER COLUMN id SET DEFAULT nextval('knex_migrations_id_seq'::regclass);


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY accounts (id, facebook_id, name, email, created_at) FROM stdin;
18a91a83-904f-4aa1-949d-d9d01010de33	1119072518111932	Andy Carlson	2yinyang2@gmail.com	2016-11-08 04:44:08.915539-08
\.


--
-- Data for Name: knex_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY knex_migrations (id, name, batch, migration_time) FROM stdin;
1	20161205213233_baseline.js	1	2016-12-07 21:24:17.225-08
\.


--
-- Name: knex_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('knex_migrations_id_seq', 1, true);


--
-- Data for Name: knex_migrations_lock; Type: TABLE DATA; Schema: public; Owner: -
--

COPY knex_migrations_lock (is_locked) FROM stdin;
0
\.


--
-- Data for Name: points; Type: TABLE DATA; Schema: public; Owner: -
--

COPY points (id, lat, lng, alt, floor_level, vertical_accuracy, horizontal_accuracy, account_id, created_at) FROM stdin;
f333bfd0-bd02-11e6-8a04-4304b2532d48	34.1065075	-118.3318681	20.5589752567	\N	\N	\N	18a91a83-904f-4aa1-949d-d9d01010de33	2016-11-30 17:44:08.915539-08
e54bc9e0-bd06-11e6-bb4d-0f490bb3511f	34.6507534	-118.1868112	20.8975256703	\N	\N	\N	18a91a83-904f-4aa1-949d-d9d01010de33	2016-12-07 20:44:08.915539-08
204ebdae-bd07-11e6-9cdc-1ff2b578e83a	34.075342	-118.6811228	20.7525670311	\N	\N	\N	18a91a83-904f-4aa1-949d-d9d01010de33	2016-12-07 20:44:09.915539-08
37663d64-bd07-11e6-857d-3b7fc8da5887	34.5342006	-118.1122871	20.2567031101	\N	\N	\N	18a91a83-904f-4aa1-949d-d9d01010de33	2016-12-07 20:44:10.915539-08
\.


--
-- Name: accounts_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY accounts
    ADD CONSTRAINT accounts_email_key UNIQUE (email);


--
-- Name: accounts_facebook_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY accounts
    ADD CONSTRAINT accounts_facebook_id_key UNIQUE (facebook_id);


--
-- Name: accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: knex_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY knex_migrations
    ADD CONSTRAINT knex_migrations_pkey PRIMARY KEY (id);


--
-- Name: points_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY points
    ADD CONSTRAINT points_pkey PRIMARY KEY (id);


--
-- Name: points_account_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY points
    ADD CONSTRAINT points_account_fkey FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

