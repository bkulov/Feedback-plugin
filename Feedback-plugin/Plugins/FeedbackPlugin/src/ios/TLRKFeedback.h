//
//  FeedbackPlugin.h
//  FeedbackPlugin
//
//  Created by Stanislav Nedelchev on 3/3/14.
//  Copyright (c) 2014 Telerik. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <Cordova/CDVPlugin.h>

@interface TLRKFeedback : CDVPlugin
-(void)getSystemInfo:(CDVInvokedUrlCommand *)command;
-(void)getScreenshot:(CDVInvokedUrlCommand *)command;
@end
