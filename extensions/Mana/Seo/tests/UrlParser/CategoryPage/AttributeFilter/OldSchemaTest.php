<?php
/** 
 * @category    Mana
 * @package     Mana_Seo
 * @copyright   Copyright (c) http://www.manadev.com
 * @license     http://www.manadev.com/license  Proprietary License
 */
/**
 * @author Mana Team
 *
 */
class Mana_Seo_Test_UrlParser_CategoryPage_AttributeFilter_OldSchemaTest extends Mana_Seo_Test_Case {
    public function testSingleValue() {
        $this->assertParsedUrl('apparel/where/color/black.html', array(
            'route' => 'catalog/category/view',
            'status' => Mana_Seo_Model_ParsedUrl::STATUS_OBSOLETE,
            'params' => array('id' => 18),
            'query' => array(
                'color' => 24,
            ),
        ));
    }

    public function testMultipleValue() {
        $this->assertParsedUrl('apparel/where/color/black_blue.html', array(
            'route' => 'catalog/category/view',
            'status' => Mana_Seo_Model_ParsedUrl::STATUS_OBSOLETE,
            'params' => array('id' => 18),
            'query' => array(
                'color' => '24_25',
            ),
        ));
    }

    public function testTwoFilters() {
        $this->assertParsedUrl('apparel/where/color/black_blue/shoe-type/dress.html', array(
            'route' => 'catalog/category/view',
            'status' => Mana_Seo_Model_ParsedUrl::STATUS_OBSOLETE,
            'params' => array('id' => 18),
            'query' => array(
                'color' => '24_25',
                'shoe_type' => 52,
            ),
        ));
    }
}