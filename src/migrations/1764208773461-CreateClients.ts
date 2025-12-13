import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClients1764208773461 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        -- Script para hoja: Lunes
        INSERT INTO client (
            nombre, direccion, comuna, telefono, email, fecha_ingreso,
            tipo_piscina, dia_mantencion, valor_mantencion,
            frecuencia_mantencion_id, "isActive"
        ) VALUES
        ('Alejandra Mc Intonsh', 'Los Trapenses 4949 C/29', 'Lo Barnechea', '569 81490150', '', '2025-11-26', 'Pintura', 'Lunes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Andrea Cristi', 'Los Trapenses 4949 C/1', 'Lo Barnechea', '569 82307903', '', '2025-11-26', 'Pintura', 'Lunes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Magdalena Silva', 'Los Trapenses 4949 C/12', 'Lo Barnechea', '569 99949339', '', '2025-11-26', 'Pintura', 'Lunes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Felipe Hurtado', 'Los Trapenses 4949 C/17', 'Lo Barnechea', '569 95495459', '', '2025-11-26', 'Pintura', 'Lunes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Teresita Silva', 'Los Trapenses 4949 C/22', 'Lo Barnechea', '056 97967935', '', '2025-11-26', 'Pintura', 'Lunes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Nayam Salma', 'Los Trapenses 4979 C/23', 'Lo Barnechea', '569 75592030', '', '2025-11-26', 'Pintura', 'Lunes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Francisco Suarez', 'Los Trapenses 4979 C/24', 'Lo Barnechea', '569 98259810', '', '2025-11-26', 'Pintura', 'Lunes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Maria Luisa', 'Los Monseñores 3836', 'Lo Barnechea', '569 76091948', '', '2025-11-26', 'Pintura', 'Lunes', 20000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Paula Ojeda', 'Los Junglares 3880 C/26', '', '569 94455813', '', '2025-11-26', 'Pintura', 'Lunes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Cond. Las Clarisas', 'Avda Troncal San Fco. 3354', 'Puente Alto', '569 57889806', '', '2025-11-26', 'Pintura', 'Lunes', 35000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('German Fernandino', 'Las Hortencias 2566', 'Providencia', '569 32670043', '', '2025-11-26', 'Pintura', 'Lunes', 14000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Javier Julian Fuentes', 'Psje Juan Moya 563 C/D', '', '569 62492449', '', '2025-11-26', 'Pintura', 'Lunes', 13000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Com Duble Almeyda', 'Duble Almeyda 2020', 'Ñuñoa', '', '', '2025-11-26', 'Pintura', 'Lunes', 35000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Maria Gracia Omegna', 'Crescente Errazuriz 1376', 'Ñuñoa', '569 68287087', '', '2025-11-26', 'Pintura', 'Lunes', 10000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Carlota Arriagada', 'Las Azucenas 2989', 'Las Condes', '569 92327459', '', '2025-11-26', 'Pintura', 'Lunes', 13000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Francisca Menichetti', 'Las Petunias 1783', 'Huechuraba', '569 95994488', '', '2025-11-26', 'Pintura', 'Lunes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Paola Gallardo', 'Amapolas 3743', 'Providencia', '569 62374611', '', '2025-11-26', 'Pintura', 'Lunes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Marcela Ortega', 'Nevada 7313', 'Las Condes', '569 77965137', '', '2025-11-26', 'Pintura', 'Lunes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Macarena Ruz', 'Nevada 7312', 'Las Condes', '569 42862646', '', '2025-11-26', 'Pintura', 'Lunes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Carlos Garay', 'Eliecer Parada 1733', 'Ñuñoa', '569 90503696', '', '2025-11-26', 'Pintura', 'Lunes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Paloma Moreno', 'Atahualpa 2105', 'Las Condes', '569 90971080', '', '2025-11-26', 'Pintura', 'Lunes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Liliana Aymani', 'Virginia 8260', 'Las Condes', '569 94245251', '', '2025-11-26', 'Pintura', 'Lunes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true);
    `);
    await queryRunner.query(`
        -- Script para hoja: Martes
        INSERT INTO client (
            nombre, direccion, comuna, telefono, email, fecha_ingreso,
            tipo_piscina, dia_mantencion, valor_mantencion,
            frecuencia_mantencion_id, "isActive"
        ) VALUES
        ('Carolina Ruiz', 'Cerro Laguna 8906 C/A', 'Lo Barnechea', '56995328476', '', '2025-11-26', 'Pintura', 'Martes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Catalina Lyon', 'Copahue 4293', 'Lo Barnechea', '56993379028', '', '2025-11-26', 'Pintura', 'Martes', 13000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Felipe Mc Laughlin', 'Curarruhue 4475', 'Las Condes', '56944719494', '', '2025-11-26', 'Pintura', 'Martes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Juan P.Matte', 'Curarruhue 4483', 'Las Condes', '56993370281', '', '2025-11-26', 'Pintura', 'Martes', 13000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('M. Jose Errazuriz', 'Av. Parques Golf 10620/C311', 'Lo Barnechea', '56992393261', '', '2025-11-26', 'Pintura', 'Martes', 13000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Anita Orellana', 'Golf Lomas La Dehesa 10724', 'Lo Barnechea', '56982595785', '', '2025-11-26', 'Pintura', 'Martes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Santiago Long', 'Golf Lomas La Dehesa 10526', 'Lo Barnechea', '56992754692', '', '2025-11-26', 'Pintura', 'Martes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Cecilia Mena', 'Camino Pta. De Aguilas 4583-5', 'Lo Barnechea', '56998710247', '', '2025-11-26', 'Pintura', 'Martes', 13000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Mercedes Rodriguez', 'Boul Jardin Los Pajaros 4604', 'Lo Barnechea', '56982298668', '', '2025-11-26', 'Pintura', 'Martes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Paulina Orellana', 'Copahue Interior 4236', 'Lo Barnechea', '56998180998', '', '2025-11-26', 'Pintura', 'Martes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Angela Barros', 'Camino La Loica 5021', 'Lo Barnechea', '56998246381', '', '2025-11-26', 'Pintura', 'Martes', 13000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Ignacia Feller', 'Avda. Los Litres No 500 C/34', 'Lo Barnechea', '56986622557', '', '2025-11-26', 'Pintura', 'Martes', 13000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Magdalena Varela', 'Avda. Los Litres No 500 C/1', 'Lo Barnechea', '56987299753', '', '2025-11-26', 'Pintura', 'Martes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Jaime Eyzaguirre', 'Avda. Los Litres No 1200 C/36', 'Lo Barnechea', '56953723814', '', '2025-11-26', 'Pintura', 'Martes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Matias Alessandri', 'Camino Real 4593', 'Lo Barnechea', '56963039242', '', '2025-11-26', 'Pintura', 'Martes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Fernando Manchant', 'Parque Golf 10600 C/9', '', '56962384248', '', '2025-11-26', 'Pintura', 'Martes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Claudio Fiuca', 'La Fragua Oriente 5425', 'Lo Barnechea', '56998724802', '', '2025-11-26', 'Pintura', 'Martes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Isabel Solarza', 'La Foresta Oriente C/21', 'Lo Barnechea', '56995195567', '', '2025-11-26', 'Pintura', 'Martes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Cristian Lopesich', 'Luis Matte L. 10135', 'Puente Alto', '56995482981', '', '2025-11-26', 'Pintura', 'Martes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Victoria Giacoman', 'Psje.Sanzipar No7042', 'Vitacura', '56989207756', '', '2025-11-26', 'Pintura', 'Martes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Mariana Donoso', 'Fray Jorge No 591', 'Las Condes', '56992319181', '', '2025-11-26', 'Pintura', 'Martes', 13000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Ma de los Angeles Selman', 'Rio Loa 8665', 'Las Condes', '56996370491', '', '2025-11-26', 'Pintura', 'Martes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Laura Wallenstein', 'Las Verbenas 7960', 'Las Condes', '56978565406', '', '2025-11-26', 'Pintura', 'Martes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Veronica Celedon', 'Los Peñascos 2590', 'Lo Barnechea', '56989297696', '', '2025-11-26', 'Pintura', 'Martes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Cecilia Bravo', 'Santa Blanca 1756', 'Lo Barnechea', '56996491370', '', '2025-11-26', 'Pintura', 'Martes', 13000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Maria Jose Bravo', 'Santa Blanca 1687', 'Lo Barnechea', '56992569741', '', '2025-11-26', 'Pintura', 'Martes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Cecilia Camus', 'RioTrancura No 11324', 'Las Condes', '56998372101', '', '2025-11-26', 'Pintura', 'Martes', 18000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Catalina Bravo', 'Las Lomas 790', 'Lo Barnechea', '56964472620', '', '2025-11-26', 'Pintura', 'Martes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Trinidad Mena', 'Camino El Alba 12283', 'Las Condes', '56962370910', '', '2025-11-26', 'Pintura', 'Martes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Anita Yunke', 'Camino entre Lomas 10344', 'Lo Barnechea', '56992390046', '', '2025-11-26', 'Pintura', 'Martes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Ricardo Melnick', 'Avda. Del Monte 435', 'El Monte', '56990894513', '', '2025-11-26', 'Pintura', 'Martes', 20000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Francisca Varela', 'Camino El Alba 12145', 'Las Condes', '56997178115', '', '2025-11-26', 'Pintura', 'Martes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Alfonso Bullomore', 'Santa Veronica 1035', 'La Cisterna', '56998218288', '', '2025-11-26', 'Pintura', 'Martes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true);
    `);

    await queryRunner.query(`
        -- Script para hoja: Miércoles
        INSERT INTO client (
            nombre, direccion, comuna, telefono, email, fecha_ingreso,
            tipo_piscina, dia_mantencion, valor_mantencion,
            frecuencia_mantencion_id, "isActive"
        ) VALUES
        ('Maria A.Rios', 'Camino El Misionero 9479', 'San Bernardo', '56 997796531', '', '2025-11-26', 'Pintura', 'Miércoles', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Janine Cooper', 'Camino El Misionero 9481', 'San Bernardo', '56994991733', '', '2025-11-26', 'Pintura', 'Miércoles', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Andrea Fernandez', 'Camino El Misionero 9455', 'San Bernardo', '56962095017', '', '2025-11-26', 'Pintura', 'Miércoles', 13000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Francisca Arteaga', 'Pedro Lira Urqueta 9956', 'Lo Barnechea', '56992387036', '', '2025-11-26', 'Pintura', 'Miércoles', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Adriana Varela', 'Las Hualtatas 5075 C/21', 'Vitacura', '56994797274', '', '2025-11-26', 'Pintura', 'Miércoles', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Enrique Brinkman', 'Las Hualtatas 5075 C/23', 'Vitacura', '56997330181', '', '2025-11-26', 'Pintura', 'Miércoles', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Catalina Lanas', 'Los Trapenses 4860 C/17', 'Lo Barnechea', '56934407316', '', '2025-11-26', 'Pintura', 'Miércoles', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Martin Larrain', 'Los Trapenses 4860 C/11', 'Lo Barnechea', '56990830015', '', '2025-11-26', 'Pintura', 'Miércoles', 18000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Juan J. Altamirano', 'Cerro Aguas Claras 760 C/B', 'Lo Barnechea', '56982946317', '', '2025-11-26', 'Pintura', 'Miércoles', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Mauricio Silva', 'Cerro Aguas Claras 760 C/G', 'Lo Barnechea', '56998371475', '', '2025-11-26', 'Pintura', 'Miércoles', 13000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Gonzalo Badilla', 'Cerro Aguas Claras 760 C/H', 'Lo Barnechea', '56992004253', '', '2025-11-26', 'Pintura', 'Miércoles', 13000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Patricia Hurtado', 'Cerro Aguas Claras 760 C/c', 'Lo Barnechea', '56982949390', '', '2025-11-26', 'Pintura', 'Miércoles', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Daniela Zecchetto', 'Cerros Aguas Claras 10429', 'Lo Barnechea', '56996406370', '', '2025-11-26', 'Pintura', 'Miércoles', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Alejandro Abarca', 'Plaza del Retiro No 3835', 'Vitacura', '56978896636', '', '2025-11-26', 'Pintura', 'Miércoles', 18000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Luz Maria Guzman', 'Valle del Monasterio 2131 C/1', 'Lo Barnechea', '56992277587', '', '2025-11-26', 'Pintura', 'Miércoles', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Cloudine Lopez', 'Valle del Monasterio 2131 C/3', 'Lo Barnechea', '56984394415', '', '2025-11-26', 'Pintura', 'Miércoles', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Carolina Fortin', 'Valle del Monasterio 2131 C/10', 'Lo Barnechea', '56979763619', '', '2025-11-26', 'Pintura', 'Miércoles', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Andrea Mery', 'Camino Los Pastores 4653', 'Lo Barnechea', '56995452292', '', '2025-11-26', 'Pintura', 'Miércoles', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Francisco Leiva', 'Novalis 5735 C/A', 'Las Condes', '56975387561', '', '2025-11-26', 'Pintura', 'Miércoles', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Alejandra Melo', 'Novalis 5735 C/C', 'Las Condes', '56988886194', '', '2025-11-26', 'Pintura', 'Miércoles', 13000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Yasna Cornejo', 'Alto Macul No 6544 C/25', 'La Florida', '56984640860', '', '2025-11-26', 'Pintura', 'Miércoles', 16000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Jose Palomo', 'Quilin 6873', 'Peñalolén', '56998958472', '', '2025-11-26', 'Pintura', 'Miércoles', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Josselyn Centeno', 'Oceano Artico 2690', 'Peñalolén', '56997461397', '', '2025-11-26', 'Pintura', 'Miércoles', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Gean Brunetto', 'Los Coiguez 12935', 'Lo Barnechea', '56999176614', '', '2025-11-26', 'Pintura', 'Miércoles', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Roberto Busel', 'Los Coiguez 12932', 'Lo Barnechea', '56998261559', '', '2025-11-26', 'Pintura', 'Miércoles', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Pilar Cosmelli', 'Camino La Viña 12147-B', 'Las Condes', '56992257478', '', '2025-11-26', 'Pintura', 'Miércoles', 13000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Gracia Cosmelli', 'Camino La Viña 12125', 'Las Condes', '56998221427', '', '2025-11-26', 'Pintura', 'Miércoles', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Luz Cosmelli', 'Camino La Viña 12145', 'Las Condes', '56991616250', '', '2025-11-26', 'Pintura', 'Miércoles', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Dany Tadres', 'San Francisco de Asis 1781', 'Las Condes', '56993248757', '', '2025-11-26', 'Pintura', 'Miércoles', 13000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Ingrid Bergen', 'Pasaje Romeral 9568', 'Peñalolén', '56977574230', '', '2025-11-26', 'Pintura', 'Miércoles', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Javier Juanicotena', 'Leo 9049', 'Maipú', '56978997988', '', '2025-11-26', 'Pintura', 'Miércoles', 13000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Jorge Claidsac', 'Fernando de Arguello 8422', 'Las Condes', '56992278390', '', '2025-11-26', 'Pintura', 'Miércoles', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Sara Orellana', 'Las Clarisas 88', 'Las Condes', '56993447973', '', '2025-11-26', 'Pintura', 'Miércoles', 13000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true);
    `);

    await queryRunner.query(`
        -- Script para hoja: Jueves
        INSERT INTO client (
            nombre, direccion, comuna, telefono, email, fecha_ingreso,
            tipo_piscina, dia_mantencion, valor_mantencion,
            frecuencia_mantencion_id, "isActive"
        ) VALUES
        ('Ramiro Cadena', 'La Cienaga 12282', 'Lo Barnechea', '56990798410', '', '2025-11-26', 'Pintura', 'Jueves', 13000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Patricio Rifo', 'La Cienaga 12395', 'Lo Barnechea', '56996327959', '', '2025-11-26', 'Pintura', 'Jueves', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Heidi del Rio', 'La Cienaga 12316', 'Lo Barnechea', '56987193504', '', '2025-11-26', 'Pintura', 'Jueves', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Andres Diaz', 'Mirador 12388', 'Lo Barnechea', '56984098154', '', '2025-11-26', 'Pintura', 'Jueves', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Pablo Diaz', 'Calle Parque 12700 C/5', 'Lo Barnechea', '56978610322', '', '2025-11-26', 'Pintura', 'Jueves', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Beatriz Squella', 'Calle Parque 12700 C/24', 'Lo Barnechea', '56993341196', '', '2025-11-26', 'Pintura', 'Jueves', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Dominique Henriquez', 'Calle Parque 12700 C/25', 'Lo Barnechea', '56963941024', '', '2025-11-26', 'Pintura', 'Jueves', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Franco Ferrini', 'Calle Parque 12701 C/35', 'Lo Barnechea', '56979667868', '', '2025-11-26', 'Pintura', 'Jueves', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Angelica Skalweit', 'Calle Parque 12891', 'Lo Barnechea', '56995494144', '', '2025-11-26', 'Pintura', 'Jueves', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Alejandra Cornejo', 'San Galen 53', 'Lo Barnechea', '56998857239', '', '2025-11-26', 'Pintura', 'Jueves', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Loreto Vargas', 'San Galen 97', 'Lo Barnechea', '56999103010', '', '2025-11-26', 'Pintura', 'Jueves', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Domingo Arteaga', 'San Galen 109', 'Lo Barnechea', '56992759419', '', '2025-11-26', 'Pintura', 'Jueves', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Juan Davila', 'San Galen 125', 'Lo Barnechea', '56978557410', '', '2025-11-26', 'Pintura', 'Jueves', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Paulina Alvarez', 'Camino el Candil 2001', 'Lo Barnechea', '56984791239', '', '2025-11-26', 'Pintura', 'Jueves', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Felicita Otero', 'Los Alpes 4679 C/B', 'Las Condes', '56990582308', '', '2025-11-26', 'Pintura', 'Jueves', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Cecilia Olivares', 'El Faldeo 4009', 'Lo Barnechea', '56998222675', '', '2025-11-26', 'Pintura', 'Jueves', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Francisco Jaramillo', 'Camino de la Colina 3023', 'Lo Barnechea', '56983601014', '', '2025-11-26', 'Pintura', 'Jueves', 13000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Angelica Capurro', 'Cerro La Araña 12279', 'Lo Barnechea', '56943877188', '', '2025-11-26', 'Pintura', 'Jueves', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Paola Dapelo', 'Monseñor Adolfo 12683 c/34', 'Lo Barnechea', '56982298668', '', '2025-11-26', 'Pintura', 'Jueves', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Vanessa Ramos', 'Basel 4606 C/I', 'Las Condes', '56962496747', '', '2025-11-26', 'Pintura', 'Jueves', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Paola Rios', 'Los Cercos 4122', 'Lo Barnechea', '56966743744', '', '2025-11-26', 'Pintura', 'Jueves', 14000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Carla Quevedo', 'Los Cercos 4089', 'Lo Barnechea', '56995316988', '', '2025-11-26', 'Pintura', 'Jueves', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Andrea Bajardi', 'Orocopio 690 C/13', 'Las Condes', '56988894573', '', '2025-11-26', 'Pintura', 'Jueves', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Mariluz Ahumada', 'Alvaro Casanova 838 C/F', 'Peñalolén', '56988199547', '', '2025-11-26', 'Pintura', 'Jueves', 14000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Claudia Pino', 'Orocopio C/4', 'Las Condes', '56977487494', '', '2025-11-26', 'Pintura', 'Jueves', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Constanza Vargas', 'Orocopio C/11', 'Las Condes', '56990444777', '', '2025-11-26', 'Pintura', 'Jueves', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Adriana Muat', 'Carlos Silva Vildosala C/D', 'La Reina', '56975493514', '', '2025-11-26', 'Pintura', 'Jueves', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Gonzalo Becerra', 'Carlos Silva Vildosala C/E', 'La Reina', '56997137892', '', '2025-11-26', 'Pintura', 'Jueves', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Loreto Solari', 'Carlos Silva Vildosala C/G', 'La Reina', '56992395028', '', '2025-11-26', 'Pintura', 'Jueves', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Yenny Farias', 'Educ Minerva 10232 C/A', 'Lo Barnechea', '56961434930', '', '2025-11-26', 'Pintura', 'Jueves', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Macarena Monsalve', 'Educ Minerva 10232 C/B', 'Lo Barnechea', '56930184451', '', '2025-11-26', 'Pintura', 'Jueves', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Erick Gomez', 'Educ Minerva 10232 C D', 'Lo Barnechea', '56987295233', '', '2025-11-26', 'Pintura', 'Jueves', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Margarita Romeo', 'Onofre Jarpa 10295', 'La Reina', '56995040470', '', '2025-11-26', 'Pintura', 'Jueves', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true);
    `);

    await queryRunner.query(`
        -- Script para hoja: Viernes
        INSERT INTO client (
            nombre, direccion, comuna, telefono, email, fecha_ingreso,
            tipo_piscina, dia_mantencion, valor_mantencion,
            frecuencia_mantencion_id, "isActive"
        ) VALUES
        ('Rafael Carrasco', 'Dr Alfredo Almeyda 6686', 'Ñuñoa', '56984186984', '', '2025-11-26', 'Pintura', 'Viernes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Jose Antonio Varas', 'Dr Alfredo Almeyda 6682', 'Ñuñoa', '56961905676', '', '2025-11-26', 'Pintura', 'Viernes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Irma de la Maza', 'Gral Eugenio Garzon 6685', 'Macul', '56992275715', '', '2025-11-26', 'Pintura', 'Viernes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Santiago Paulovic', 'Gral Eugenio Garzon 6509', 'Macul', '56997356569', '', '2025-11-26', 'Pintura', 'Viernes', 13000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Marta Caro', 'Rio Tiber 2260', 'Las Condes', '56993181259', '', '2025-11-26', 'Pintura', 'Viernes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Stefano Di Biase', 'Rio Tiber 2247', 'Las Condes', '56998271340', '', '2025-11-26', 'Pintura', 'Viernes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Veronica Alledes', 'Rio Arno 2210', 'Las Condes', '56982891748', '', '2025-11-26', 'Pintura', 'Viernes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Ed. Los Prados de Vitacura', 'San Patricio 3983', 'Vitacura', '227240998', '', '2025-11-26', 'Pintura', 'Viernes', 25000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Denis Costa', 'Delfos 2224', 'Las Condes', '56976861733', '', '2025-11-26', 'Pintura', 'Viernes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Marco Berchelino', 'Delfos 2249', 'Las Condes', '56991622809', '', '2025-11-26', 'Pintura', 'Viernes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Vivian Farias', 'Hernando Magallanes 1208', 'Las Condes', '56992406361', '', '2025-11-26', 'Pintura', 'Viernes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Cristobal Hereimans', 'Bernarda Vallejos 1422', 'Lo Barnechea', '56993302155', '', '2025-11-26', 'Pintura', 'Viernes', 14000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Lain Diaz', 'Bernarda Vallejos 1437', 'Lo Barnechea', '56966699776', '', '2025-11-26', 'Pintura', 'Viernes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Jorge Misleh', 'El Pillan 1700', 'Las Condes', '56998888716', '', '2025-11-26', 'Pintura', 'Viernes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Cristian Rigeling', 'Carlos Sabad 6329', 'Lo Barnechea', '56994030272', '', '2025-11-26', 'Pintura', 'Viernes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Maria Angelica Lanas', 'Ibiza 5599', 'Las Condes', '56985354688', '', '2025-11-26', 'Pintura', 'Viernes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Rodrigo Araya', 'Copihual No 4765', 'Las Condes', '56993094101', '', '2025-11-26', 'Pintura', 'Viernes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Jose Miguel Castillo', 'Candelaria Goyenechea 5564', 'Vitacura', '56930097038', '', '2025-11-26', 'Pintura', 'Viernes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Guido Hernandez', 'Los Insigne P/6', 'Vitacura', '56999783450', '', '2025-11-26', 'Pintura', 'Viernes', 14000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Jorge Quevedo', 'Los Insigne P/16', 'Vitacura', '56984198674', '', '2025-11-26', 'Pintura', 'Viernes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Raquel Kubik', 'Los Insigne P/37', 'Vitacura', '56971252296', '', '2025-11-26', 'Pintura', 'Viernes', 20000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Mariane Jimenez', 'San Fco. De Nos P/36', 'San Bernardo', '56983601022', '', '2025-11-26', 'Pintura', 'Viernes', 18000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Gonzalo Aglicati', 'Los Reales P/35', 'Lo Barnechea', '56992206082', '', '2025-11-26', 'Pintura', 'Viernes', 13000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Marcelo Agurto', 'Los Berbechos Sur 9060', 'Las Condes', '56995441820', '', '2025-11-26', 'Pintura', 'Viernes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Jenny Lopez', 'Los Berbechos Norte 8982', 'Las Condes', '56992621189', '', '2025-11-26', 'Pintura', 'Viernes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Margarita Asada', 'Abedul Plateado C. 9184', 'Lo Barnechea', '56965553570', '', '2025-11-26', 'Pintura', 'Viernes', 13000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('John Parra', 'Abedul Plateado C. 9193', 'Lo Barnechea', '56932561153', '', '2025-11-26', 'Pintura', 'Viernes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Moises Gutierrez', 'Los Suspiros 16340 C/15', 'Lo Barnechea', '56941862001', '', '2025-11-26', 'Pintura', 'Viernes', 13000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Pedro Bernal', 'Los Suspiros 16340 C/139', 'Lo Barnechea', '56936210060', '', '2025-11-26', 'Pintura', 'Viernes', 15000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true),
        ('Veronica Navarrete', 'Jardin Alto 9012', 'La Florida', '56994899731', '', '2025-11-26', 'Pintura', 'Viernes', 12000, '9e317a26-2a75-4983-b92f-cb7e6f8c79a2', true);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE FROM client
        WHERE dia_mantencion = 'Lunes';
    `);

    await queryRunner.query(`
        DELETE FROM client
        WHERE dia_mantencion = 'Martes';
    `);

    await queryRunner.query(`
        DELETE FROM client
        WHERE dia_mantencion = 'Miércoles';
    `);

    await queryRunner.query(`
        DELETE FROM client
        WHERE dia_mantencion = 'Jueves';
    `);

    await queryRunner.query(`
        DELETE FROM client
        WHERE dia_mantencion = 'Viernes';
    `);
  }
}
