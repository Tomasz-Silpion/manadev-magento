<?php
/** 
 * @category    Mana
 * @package     Mana_AttributePage
 * @copyright   Copyright (c) http://www.manadev.com
 * @license     http://www.manadev.com/license  Proprietary License
 */
/**
 * @author Mana Team
 *
 */
class Mana_AttributePage_Block_Adminhtml_OptionPage_GeneralFormTab extends Mana_Admin_Block_V2_Tab  {
    public function getTitle() {
        return $this->__('General');
    }

    public function getAjaxUrl() {
        $id = Mage::app()->getRequest()->getParam('id');
        return $this->adminHelper()->getStoreUrl('*/*/tabGeneral',
            $id ? compact('id') : array(),
            array('ajax' => 1)
        );
    }
}