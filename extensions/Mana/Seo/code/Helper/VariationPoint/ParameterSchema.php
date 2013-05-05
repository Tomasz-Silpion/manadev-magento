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
class Mana_Seo_Helper_VariationPoint_ParameterSchema extends Mana_Seo_Helper_VariationPoint {
    /**
     * @param Mana_Seo_Model_VariationPoint $variationPoint
     * @return Mana_Seo_Helper_VariationSource[]
     */
    public function getVariationSources($variationPoint) {
        /* @var $seo Mana_Seo_Helper_Data */
        $seo = Mage::helper('mana_seo');
        return $seo->getParameterSchemaProviders();
    }

    /**
     * @param Mana_Seo_Model_Context $context
     * @param Mana_Seo_Model_VariationPoint $variationPoint
     * @param Mana_Seo_Model_Schema $variation
     * @return Mana_Seo_Helper_VariationPoint
     */
    public function registerVariation($context, $variationPoint, $variation) {
        $context->setSchema($variation);

        return $this;
    }

    /**
     * @param Mana_Seo_Model_Context $context
     * @param Mana_Seo_Model_VariationPoint $variationPoint
     * @param Mana_Seo_Model_Schema $variation
     * @return Mana_Seo_Helper_VariationPoint
     */
    public function unregisterVariation($context, $variationPoint, $variation) {
        $context->unsetData('schema');

        return $this;
    }
}